const state = {
  mode: 'form',
  path: '',
  raw: '',
  data: {},
  meta: {},
  upstreamTests: {},
  preview: null,
};

const els = {
  formMode: document.getElementById('form-mode'),
  rawMode: document.getElementById('raw-mode'),
  rawEditor: document.getElementById('raw-editor'),
  status: document.getElementById('status'),
  configPath: document.getElementById('config-path'),
  formModeBtn: document.getElementById('form-mode-btn'),
  rawModeBtn: document.getElementById('raw-mode-btn'),
  reloadBtn: document.getElementById('reload-btn'),
  saveBtn: document.getElementById('save-btn'),
};

const HELP = {
  host: '服务监听地址。开发时一般用 0.0.0.0，表示允许局域网或容器访问。',
  port: '服务监听端口。默认 8000。',
  ttl: '模型列表缓存时长，单位秒。值越大，请求 /v1/models 越少。',
  truncate_prompt_chars: '调试日志里 prompt 的截断长度，避免日志太长。',
  base_url: '上游模型服务地址，例如 http://host.docker.internal:11434 或 http://127.0.0.1:30003',
  api_key: '如果上游需要鉴权就在这里填，不需要可留空。',
  timeout: '请求该 upstream 的超时时间，单位秒。',
  models_path: '用于拉取模型列表的接口路径，通常是 /v1/models。',
  headers: '额外请求头，填 JSON 对象。适合放固定鉴权头或特殊上游要求的 header。',
  upstream_name: 'upstream 的唯一名字，routing 和 alias 都会引用它。',
  alias_name: '对外暴露给客户端的模型别名。客户端请求这个名字时会映射到 target model。',
  target_model: '实际转发给上游的模型名，例如 Qwen/Qwen3.5-27B-FP8。',
  path_rule: '把特定 API 路径定向到某个 upstream，例如 /v1/embeddings。',
  override_key: '要覆盖的参数名，例如 temperature、top_p、top_k。',
  override_value: 'override 的值。支持数字、true/false、null、字符串。',
  extra_body: '附加到请求体中的额外字段，填 JSON 对象。适合 provider 专属参数。',
};

const SELECT_HELP = {
  overrideMode: 'default：仅在用户没传该参数时补默认值；force：强制覆盖用户传值；remove：删除该参数。',
  defaultUpstream: '当模型没命中 alias 或路径规则时，默认转发到这里。',
  targetUpstream: 'alias 命中后，请求会转发到这里。',
  routeUpstream: '这条 path rule 命中后，请求会转发到这里。',
};

function setStatus(message, type = 'ok') {
  els.status.textContent = message;
  els.status.className = `status ${type}`;
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
  if (!res.ok) throw new Error(data.detail || data.message || `HTTP ${res.status}`);
  return data;
}

function formPayload() {
  return state.mode === 'raw'
    ? { mode: 'raw', raw: els.rawEditor.value }
    : { mode: 'form', data: state.data };
}

async function loadConfig() {
  setStatus('正在加载配置...', 'ok');
  const payload = await requestJson('/api/ui/config');
  state.path = payload.path;
  state.raw = payload.raw;
  state.data = payload.data;
  state.meta = payload.meta || {};
  state.upstreamTests = {};
  state.preview = null;
  els.configPath.textContent = payload.path;
  els.rawEditor.value = state.raw;
  render();
  setStatus('配置已加载', 'ok');
}

function render() {
  els.formMode.classList.toggle('hidden', state.mode !== 'form');
  els.rawMode.classList.toggle('hidden', state.mode !== 'raw');
  els.formModeBtn.classList.toggle('active', state.mode === 'form');
  els.rawModeBtn.classList.toggle('active', state.mode === 'raw');
  if (state.mode === 'form') renderFormMode();
}

function createLabel(label, tooltip = '') {
  const row = document.createElement('div');
  row.className = 'label-row';
  const text = document.createElement('label');
  text.textContent = label;
  row.appendChild(text);
  if (tooltip) {
    const icon = document.createElement('span');
    icon.className = 'help-icon';
    icon.textContent = 'i';
    icon.setAttribute('data-tooltip', tooltip);
    row.appendChild(icon);
  }
  return row;
}

function textField(label, value, oninput, type = 'text', options = {}) {
  const div = document.createElement('div');
  div.className = 'field';
  div.appendChild(createLabel(label, options.tooltip || ''));
  const input = document.createElement('input');
  input.type = type;
  input.value = value ?? '';
  input.oninput = (e) => oninput(e.target.value);
  div.appendChild(input);
  if (options.helpText) {
    const small = document.createElement('div');
    small.className = 'muted small';
    small.textContent = options.helpText;
    div.appendChild(small);
  }
  return div;
}

function checkboxField(label, checked, oninput, options = {}) {
  const div = document.createElement('div');
  div.className = 'field';
  div.appendChild(createLabel(label, options.tooltip || ''));
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = !!checked;
  input.onchange = (e) => oninput(e.target.checked);
  div.appendChild(input);
  if (options.helpText) {
    const small = document.createElement('div');
    small.className = 'muted small';
    small.textContent = options.helpText;
    div.appendChild(small);
  }
  return div;
}

function selectField(label, value, options, oninput, config = {}) {
  const div = document.createElement('div');
  div.className = 'field';
  div.appendChild(createLabel(label, config.tooltip || ''));
  const select = document.createElement('select');
  options.forEach((optionValue) => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue || '请选择';
    if ((value ?? '') === optionValue) option.selected = true;
    select.appendChild(option);
  });
  select.onchange = (e) => oninput(e.target.value);
  div.appendChild(select);
  if (config.selectHelp) {
    const help = document.createElement('div');
    help.className = 'select-help';
    help.textContent = config.selectHelp;
    div.appendChild(help);
  }
  return div;
}

function datalistField(label, value, options, oninput, config = {}) {
  const div = document.createElement('div');
  div.className = 'field';
  div.appendChild(createLabel(label, config.tooltip || ''));
  const input = document.createElement('input');
  const listId = `datalist-${Math.random().toString(36).slice(2)}`;
  input.setAttribute('list', listId);
  input.value = value ?? '';
  input.oninput = (e) => oninput(e.target.value);
  div.appendChild(input);

  const datalist = document.createElement('datalist');
  datalist.id = listId;
  (options || []).forEach((optionValue) => {
    const option = document.createElement('option');
    option.value = optionValue;
    datalist.appendChild(option);
  });
  div.appendChild(datalist);

  if (config.selectHelp) {
    const help = document.createElement('div');
    help.className = 'select-help';
    help.textContent = config.selectHelp;
    div.appendChild(help);
  }
  return div;
}

function textareaField(label, value, oninput, helpText = '', tooltip = '') {
  const div = document.createElement('div');
  div.className = 'field';
  div.appendChild(createLabel(label, tooltip));
  if (helpText) {
    const small = document.createElement('div');
    small.className = 'muted small';
    small.textContent = helpText;
    div.appendChild(small);
  }
  const ta = document.createElement('textarea');
  ta.value = value ?? '';
  ta.oninput = (e) => oninput(e.target.value);
  div.appendChild(ta);
  return div;
}

function jsonText(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

function safeJsonParse(text, fallback = {}) {
  try {
    return text.trim() ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function parseLooseValue(value) {
  const text = String(value ?? '').trim();
  if (text === '') return '';
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null') return null;
  if (!Number.isNaN(Number(text)) && text !== '') return Number(text);
  return text;
}

function normalizeOverrideEntries(overrides) {
  return Object.entries(overrides || {}).map(([key, rule]) => ({
    key,
    mode: rule?.mode || 'default',
    value: rule?.value ?? '',
  }));
}

function denormalizeOverrideEntries(entries) {
  const result = {};
  (entries || []).forEach((entry) => {
    const key = String(entry?.key || '').trim();
    if (!key) return;
    result[key] = {
      mode: entry?.mode || 'default',
      value: parseLooseValue(entry?.value ?? ''),
    };
  });
  return result;
}

function getUpstreamNames() {
  return [''].concat((state.data.upstreams || []).map((item) => item.name || '').filter(Boolean));
}

function getTestKey(item, index) {
  return item.name || `__index_${index}`;
}

function getUpstreamModels(upstreamName) {
  return state.upstreamTests[upstreamName]?.model_ids || [];
}

function renderFormMode() {
  els.formMode.innerHTML = '';
  els.formMode.append(
    renderBasicSection(),
    renderUpstreamsSection(),
    renderRoutingSection(),
    renderOverridesSection(),
    renderAliasesSection(),
    renderModelsPreviewSection(),
  );
}

function wrapSection(title) {
  const section = document.createElement('section');
  section.className = 'section';
  const heading = document.createElement('div');
  heading.className = 'section-title';
  heading.textContent = title;
  section.appendChild(heading);
  return section;
}

function renderBasicSection() {
  const section = wrapSection('基础配置');
  const grid = document.createElement('div');
  grid.className = 'grid';
  const server = state.data.server || {};
  const debug = state.data.debug || {};
  grid.append(
    textField('Host', server.host || '', (v) => { server.host = v; }, 'text', { tooltip: HELP.host }),
    textField('Port', server.port ?? 8000, (v) => { server.port = Number(v || 0); }, 'number', { tooltip: HELP.port }),
    textField('模型缓存 TTL（秒）', state.data.models_cache_ttl_seconds ?? 60, (v) => { state.data.models_cache_ttl_seconds = Number(v || 0); }, 'number', { tooltip: HELP.ttl }),
    textField('截断日志字符数', debug.truncate_prompt_chars ?? 500, (v) => { debug.truncate_prompt_chars = Number(v || 0); }, 'number', { tooltip: HELP.truncate_prompt_chars }),
    checkboxField('打印最终 payload', debug.log_final_payload, (v) => { debug.log_final_payload = v; }),
    checkboxField('打印 headers', debug.log_headers, (v) => { debug.log_headers = v; }),
  );
  state.data.server = server;
  state.data.debug = debug;
  section.appendChild(grid);
  return section;
}

async function testUpstream(item, index) {
  const key = getTestKey(item, index);
  state.upstreamTests[key] = { loading: true, model_ids: state.upstreamTests[key]?.model_ids || [] };
  render();
  try {
    const payload = await requestJson('/api/ui/upstream/test', {
      method: 'POST',
      body: JSON.stringify({ upstream: item }),
    });
    state.upstreamTests[key] = payload;
    if (item.name && key !== item.name) {
      state.upstreamTests[item.name] = payload;
      delete state.upstreamTests[key];
    }
    setStatus(`upstream ${item.name || index + 1} 测试完成`, payload.ok ? 'ok' : 'error');
  } catch (err) {
    state.upstreamTests[key] = { ok: false, error: err.message, model_ids: [] };
    setStatus(`upstream 测试失败：${err.message}`, 'error');
  }
  render();
}

function renderUpstreamTestResult(item, index) {
  const key = getTestKey(item, index);
  const result = state.upstreamTests[item.name] || state.upstreamTests[key];
  const box = document.createElement('div');
  box.className = 'test-result muted';
  if (!result) {
    box.textContent = '还没测试。点“测试连接 / 获取模型”后，这里会显示该 upstream 的 models 列表。';
    return box;
  }
  if (result.loading) {
    box.textContent = '正在测试 upstream...';
    return box;
  }
  box.className = `test-result ${result.ok ? 'ok' : 'error'}`;
  const lines = [];
  lines.push(result.ok ? `测试成功${result.status_code ? `（${result.status_code}）` : ''}` : `测试失败${result.status_code ? `（${result.status_code}）` : ''}`);
  if (result.error) lines.push(result.error);
  if (result.ok) {
    lines.push(`发现 ${result.model_ids?.length || 0} 个模型`);
    if (result.model_ids?.length) lines.push(result.model_ids.join('\n'));
  }
  box.textContent = lines.join('\n');
  return box;
}

function renderUpstreamsSection() {
  const section = wrapSection('Upstreams');
  const list = state.data.upstreams || (state.data.upstreams = []);

  list.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const head = document.createElement('div');
    head.className = 'card-head';
    head.innerHTML = `<strong>${item.name || `Upstream ${index + 1}`}</strong>`;
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    const testBtn = document.createElement('button');
    testBtn.textContent = '测试连接 / 获取模型';
    testBtn.onclick = () => testUpstream(item, index);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = '删除';
    del.onclick = () => { list.splice(index, 1); render(); };
    actions.append(testBtn, del);
    head.appendChild(actions);
    card.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.append(
      textField('名称', item.name || '', (v) => { item.name = v; }, 'text', { tooltip: HELP.upstream_name }),
      textField('Base URL', item.base_url || '', (v) => { item.base_url = v; }, 'text', { tooltip: HELP.base_url }),
      textField('API Key', item.api_key || '', (v) => { item.api_key = v; }, 'text', { tooltip: HELP.api_key }),
      textField('Timeout', item.timeout ?? 120, (v) => { item.timeout = Number(v || 0); }, 'number', { tooltip: HELP.timeout }),
      textField('Models Path', item.models_path || '/v1/models', (v) => { item.models_path = v; }, 'text', { tooltip: HELP.models_path }),
      checkboxField('启用', item.enabled !== false, (v) => { item.enabled = v; }),
      textareaField('Headers(JSON)', jsonText(item.headers || {}), (v) => { item.headers = safeJsonParse(v, {}); }, '这里填 JSON 对象，比如 {"Authorization":"Bearer xxx"}', HELP.headers),
    );
    card.appendChild(grid);
    card.appendChild(renderUpstreamTestResult(item, index));
    section.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = '新增 upstream';
  addBtn.onclick = () => {
    list.push({ name: '', base_url: '', api_key: '', timeout: 120, enabled: true, models_path: '/v1/models', headers: {} });
    render();
  };
  section.appendChild(addBtn);
  return section;
}

function renderRoutingSection() {
  const section = wrapSection('Routing');
  const routing = state.data.routing || (state.data.routing = { default_upstream: '', path_rules: {} });
  const upstreamNames = getUpstreamNames();
  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.append(selectField('默认 Upstream', routing.default_upstream || '', upstreamNames, (v) => { routing.default_upstream = v; }, { selectHelp: SELECT_HELP.defaultUpstream }));
  section.appendChild(grid);

  const rules = Object.entries(routing.path_rules || {});
  rules.forEach(([path, upstream], index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const nextRules = Object.entries(routing.path_rules || {});
    const ruleGrid = document.createElement('div');
    ruleGrid.className = 'grid';
    ruleGrid.append(
      textField('Path', path, (v) => {
        nextRules[index][0] = v;
        routing.path_rules = Object.fromEntries(nextRules.filter(([p, u]) => p && u));
      }, 'text', { tooltip: HELP.path_rule }),
      selectField('Upstream', upstream, upstreamNames, (v) => {
        nextRules[index][1] = v;
        routing.path_rules = Object.fromEntries(nextRules.filter(([p, u]) => p && u));
      }, { selectHelp: SELECT_HELP.routeUpstream })
    );
    card.appendChild(ruleGrid);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = '删除规则';
    del.onclick = () => {
      nextRules.splice(index, 1);
      routing.path_rules = Object.fromEntries(nextRules);
      render();
    };
    card.appendChild(del);
    section.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = '新增路由规则';
  addBtn.onclick = () => {
    const nextRules = Object.entries(routing.path_rules || {});
    nextRules.push(['/v1/example', routing.default_upstream || '']);
    routing.path_rules = Object.fromEntries(nextRules);
    render();
  };
  section.appendChild(addBtn);
  return section;
}

function renderOverridesSection() {
  const section = wrapSection('Global Overrides / Extra Body');
  const overrides = state.data.global_chat_overrides || (state.data.global_chat_overrides = {});
  const overrideEntries = normalizeOverrideEntries(overrides);

  const overridesWrap = document.createElement('div');
  overridesWrap.className = 'section';
  const overridesTitle = document.createElement('div');
  overridesTitle.className = 'section-title';
  overridesTitle.textContent = 'global_chat_overrides';
  overridesWrap.appendChild(overridesTitle);

  overrideEntries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.append(
      textField('参数名', entry.key || '', (v) => {
        overrideEntries[index].key = v;
        state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      }, 'text', { tooltip: HELP.override_key }),
      selectField('Mode', entry.mode || 'default', ['default', 'force', 'remove'], (v) => {
        overrideEntries[index].mode = v;
        state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      }, { selectHelp: SELECT_HELP.overrideMode }),
      textField('Value', entry.value ?? '', (v) => {
        overrideEntries[index].value = v;
        state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      }, 'text', { tooltip: HELP.override_value, helpText: '支持 number / true / false / null / string' })
    );
    card.appendChild(grid);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = '删除 override';
    del.onclick = () => {
      overrideEntries.splice(index, 1);
      state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      render();
    };
    card.appendChild(del);
    overridesWrap.appendChild(card);
  });

  const addOverrideBtn = document.createElement('button');
  addOverrideBtn.textContent = '新增 override';
  addOverrideBtn.onclick = () => {
    overrideEntries.push({ key: '', mode: 'default', value: '' });
    state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
    render();
  };
  overridesWrap.appendChild(addOverrideBtn);

  const extraBodyWrap = document.createElement('div');
  extraBodyWrap.className = 'section';
  const extraTitle = document.createElement('div');
  extraTitle.className = 'section-title';
  extraTitle.textContent = 'global_extra_body';
  extraBodyWrap.appendChild(extraTitle);
  extraBodyWrap.appendChild(
    textareaField('Extra Body (JSON)', jsonText(state.data.global_extra_body || {}), (v) => { state.data.global_extra_body = safeJsonParse(v, {}); }, '填 JSON 对象，例如 {"provider":{"cache":true}}', HELP.extra_body)
  );

  section.append(overridesWrap, extraBodyWrap);
  return section;
}

function renderAliasesSection() {
  const section = wrapSection('Aliases');
  const list = state.data.aliases || (state.data.aliases = []);
  const upstreamNames = getUpstreamNames();

  list.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const head = document.createElement('div');
    head.className = 'card-head';
    head.innerHTML = `<strong>${item.name || `Alias ${index + 1}`}</strong>`;
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = '删除';
    del.onclick = () => { list.splice(index, 1); render(); };
    head.appendChild(del);
    card.appendChild(head);

    const modelOptions = getUpstreamModels(item.upstream);
    const baseGrid = document.createElement('div');
    baseGrid.className = 'grid';
    baseGrid.append(
      textField('Alias 名', item.name || '', (v) => { item.name = v; }, 'text', { tooltip: HELP.alias_name }),
      selectField('目标 Upstream', item.upstream || '', upstreamNames, (v) => { item.upstream = v; render(); }, { selectHelp: SELECT_HELP.targetUpstream }),
      datalistField('Target Model', item.target_model || '', modelOptions, (v) => { item.target_model = v; }, {
        tooltip: HELP.target_model,
        selectHelp: modelOptions.length ? `可选模型 ${modelOptions.length} 个，也可以继续手动输入。` : '还没有该 upstream 的模型候选。先去上面的 upstream 点测试，或者直接手填。',
      }),
    );
    card.appendChild(baseGrid);

    const overridesSection = document.createElement('div');
    overridesSection.className = 'section';
    const overridesTitle = document.createElement('div');
    overridesTitle.className = 'section-title';
    overridesTitle.textContent = 'Overrides';
    overridesSection.appendChild(overridesTitle);

    const overrideEntries = normalizeOverrideEntries(item.overrides || {});
    overrideEntries.forEach((entry, overrideIndex) => {
      const overrideCard = document.createElement('div');
      overrideCard.className = 'card';
      const overrideGrid = document.createElement('div');
      overrideGrid.className = 'grid';
      overrideGrid.append(
        textField('参数名', entry.key || '', (v) => {
          overrideEntries[overrideIndex].key = v;
          item.overrides = denormalizeOverrideEntries(overrideEntries);
        }, 'text', { tooltip: HELP.override_key }),
        selectField('Mode', entry.mode || 'default', ['default', 'force', 'remove'], (v) => {
          overrideEntries[overrideIndex].mode = v;
          item.overrides = denormalizeOverrideEntries(overrideEntries);
        }, { selectHelp: SELECT_HELP.overrideMode }),
        textField('Value', entry.value ?? '', (v) => {
          overrideEntries[overrideIndex].value = v;
          item.overrides = denormalizeOverrideEntries(overrideEntries);
        }, 'text', { tooltip: HELP.override_value, helpText: '支持 number / true / false / null / string' })
      );
      overrideCard.appendChild(overrideGrid);
      const delOverride = document.createElement('button');
      delOverride.className = 'danger';
      delOverride.textContent = '删除 override';
      delOverride.onclick = () => {
        overrideEntries.splice(overrideIndex, 1);
        item.overrides = denormalizeOverrideEntries(overrideEntries);
        render();
      };
      overrideCard.appendChild(delOverride);
      overridesSection.appendChild(overrideCard);
    });

    const addOverrideBtn = document.createElement('button');
    addOverrideBtn.textContent = '新增 override';
    addOverrideBtn.onclick = () => {
      overrideEntries.push({ key: '', mode: 'default', value: '' });
      item.overrides = denormalizeOverrideEntries(overrideEntries);
      render();
    };
    overridesSection.appendChild(addOverrideBtn);
    card.appendChild(overridesSection);

    const extraBodySection = document.createElement('div');
    extraBodySection.className = 'section';
    const extraBodyTitle = document.createElement('div');
    extraBodyTitle.className = 'section-title';
    extraBodyTitle.textContent = 'Extra Body';
    extraBodySection.appendChild(extraBodyTitle);
    extraBodySection.appendChild(
      textareaField('Extra Body (JSON)', jsonText(item.extra_body || {}), (v) => { item.extra_body = safeJsonParse(v, {}); }, '填 JSON 对象，适合 provider 专属参数', HELP.extra_body)
    );
    card.appendChild(extraBodySection);

    section.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = '新增 alias';
  addBtn.onclick = () => {
    list.push({ name: '', upstream: '', target_model: '', overrides: {}, extra_body: {} });
    render();
  };
  section.appendChild(addBtn);
  return section;
}

async function previewModels() {
  try {
    setStatus('正在预览最终 /v1/models ...', 'ok');
    state.preview = { loading: true };
    render();
    const payload = await requestJson('/api/ui/models/preview', {
      method: 'POST',
      body: JSON.stringify({ data: state.data }),
    });
    state.preview = payload;
    render();
    setStatus('模型预览已更新', 'ok');
  } catch (err) {
    state.preview = { ok: false, error: err.message, items: [] };
    render();
    setStatus(`模型预览失败：${err.message}`, 'error');
  }
}

function renderModelsPreviewSection() {
  const section = wrapSection('对外 /v1/models 预览');
  const actions = document.createElement('div');
  actions.className = 'row-actions';
  const previewBtn = document.createElement('button');
  previewBtn.textContent = '预览最终模型列表';
  previewBtn.onclick = previewModels;
  actions.appendChild(previewBtn);
  section.appendChild(actions);

  const preview = state.preview;
  const box = document.createElement('div');
  if (!preview) {
    box.className = 'test-result muted';
    box.textContent = '还没生成预览。点上面的按钮后，这里会显示 wrapper 最终对外暴露的模型列表。';
    section.appendChild(box);
    return section;
  }
  if (preview.loading) {
    box.className = 'test-result muted';
    box.textContent = '正在生成预览...';
    section.appendChild(box);
    return section;
  }
  if (!preview.ok) {
    box.className = 'test-result error';
    box.textContent = preview.error || '预览失败';
    section.appendChild(box);
    return section;
  }

  const summary = document.createElement('div');
  summary.className = 'test-result ok';
  summary.textContent = `最终将对外暴露 ${preview.items?.length || 0} 个模型`;
  section.appendChild(summary);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';
  const table = document.createElement('table');
  table.className = 'preview-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['模型名', '来源', 'Upstream', 'Target Model'].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  (preview.items || []).forEach((item) => {
    const tr = document.createElement('tr');
    [item.id || '', item.source || '', item.upstream || '-', item.target_model || '-'].forEach((text) => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  section.appendChild(tableWrap);

  const raw = document.createElement('details');
  const summaryEl = document.createElement('summary');
  summaryEl.textContent = '查看原始 models payload';
  raw.appendChild(summaryEl);
  const pre = document.createElement('pre');
  pre.className = 'raw-preview';
  pre.textContent = JSON.stringify(preview.models_payload || {}, null, 2);
  raw.appendChild(pre);
  section.appendChild(raw);
  return section;
}

async function saveConfig() {
  try {
    setStatus('正在保存配置...', 'ok');
    const payload = await requestJson('/api/ui/config', {
      method: 'POST',
      body: JSON.stringify(formPayload()),
    });
    state.path = payload.path;
    state.raw = payload.raw;
    state.data = payload.data;
    state.meta = payload.meta || state.meta;
    els.rawEditor.value = state.raw;
    render();
    setStatus('保存成功', 'ok');
    if (state.mode === 'form') {
      await previewModels();
    }
  } catch (err) {
    setStatus(`保存失败：${err.message}`, 'error');
  }
}

els.formModeBtn.onclick = () => { state.mode = 'form'; render(); };
els.rawModeBtn.onclick = () => { state.mode = 'raw'; render(); };
els.reloadBtn.onclick = async () => {
  try { await loadConfig(); } catch (err) { setStatus(`加载失败：${err.message}`, 'error'); }
};
els.saveBtn.onclick = saveConfig;

loadConfig().catch((err) => setStatus(`加载失败：${err.message}`, 'error'));
