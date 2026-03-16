const STORAGE_KEYS = {
  theme: 'openai-wrapper.ui.theme',
  locale: 'openai-wrapper.ui.locale',
};

const I18N = {
  'zh-CN': {
    appTitle: 'OpenAI Wrapper 配置界面',
    loading: '加载中...',
    formMode: '表单模式',
    rawMode: '原始 YAML',
    reload: '重新加载',
    save: '保存配置',
    themeLight: '切到浅色',
    themeDark: '切到深色',
    themeLightShort: '浅色',
    themeDarkShort: '深色',
    languageZh: '中文',
    languageEn: 'English',
    statusLoadingConfig: '正在加载配置...',
    statusConfigLoaded: '配置已加载',
    statusSavingConfig: '正在保存配置...',
    statusSaveSuccess: '保存成功',
    statusSaveFailed: '保存失败：{message}',
    statusLoadFailed: '加载失败：{message}',
    statusPreviewLoading: '正在预览最终 /v1/models ...',
    statusPreviewUpdated: '模型预览已更新',
    statusPreviewFailed: '模型预览失败：{message}',
    statusUpstreamTestDone: 'upstream {name} 测试完成',
    statusUpstreamTestFailed: 'upstream 测试失败：{message}',
    selectPlaceholder: '请选择',
    sectionBasic: '基础配置',
    sectionUpstreams: '上游配置',
    sectionRouting: '路由配置',
    sectionGlobalOverrides: '全局覆盖 / Extra Body',
    sectionAliases: '别名配置',
    sectionPreview: '对外 /v1/models 预览',
    sectionOverrides: '覆盖规则',
    sectionExtraBody: '额外字段',
    fieldHost: 'Host',
    fieldPort: 'Port',
    fieldModelsCacheTtl: '模型缓存 TTL（秒）',
    fieldTruncatePromptChars: '截断日志字符数',
    fieldLogFinalPayload: '打印最终 payload',
    fieldLogHeaders: '打印 headers',
    fieldName: '名称',
    fieldBaseUrl: 'Base URL',
    fieldApiKey: 'API Key',
    fieldTimeout: '超时时间',
    fieldModelsPath: '模型列表路径',
    fieldEnabled: '启用',
    fieldHeadersJson: '请求头 (JSON)',
    fieldDefaultUpstream: '默认上游',
    fieldPath: '路径',
    fieldUpstream: '上游',
    fieldParamName: '参数名',
    fieldMode: '模式',
    fieldValue: '值',
    fieldExtraBodyJson: '额外字段 (JSON)',
    fieldAliasName: '别名',
    fieldTargetUpstream: '目标上游',
    fieldTargetModel: '目标模型',
    btnDelete: '删除',
    btnAddUpstream: '新增 upstream',
    btnTestUpstream: '测试连接 / 获取模型',
    btnAddRouteRule: '新增路由规则',
    btnDeleteRouteRule: '删除规则',
    btnAddOverride: '新增 override',
    btnDeleteOverride: '删除 override',
    btnAddAlias: '新增 alias',
    btnPreviewModels: '预览最终模型列表',
    rawEditorLabel: '原始 YAML',
    globalChatOverrides: 'global_chat_overrides',
    globalExtraBody: 'global_extra_body',
    noUpstreamTestYet: '还没测试。点“测试连接 / 获取模型”后，这里会显示该 upstream 的 models 列表。',
    upstreamTesting: '正在测试 upstream...',
    upstreamTestSuccess: '测试成功{status}',
    upstreamTestFailed: '测试失败{status}',
    upstreamModelsFound: '发现 {count} 个模型',
    noModelOptionsYet: '还没有该 upstream 的模型候选。先去上面的 upstream 点测试，或者直接手填。',
    modelOptionsReady: '可选模型 {count} 个，也可以继续手动输入。',
    noPreviewYet: '还没生成预览。点上面的按钮后，这里会显示 wrapper 最终对外暴露的模型列表。',
    previewGenerating: '正在生成预览...',
    previewFailed: '预览失败',
    previewSummary: '最终将对外暴露 {count} 个模型',
    previewTableModel: '模型名',
    previewTableSource: '来源',
    previewTableUpstream: '上游',
    previewTableTargetModel: '目标模型',
    previewRawPayload: '查看原始 models payload',
    sourceAlias: 'alias',
    sourceUpstream: 'upstream',
    unnamedUpstream: 'Upstream {index}',
    unnamedAlias: 'Alias {index}',
    dash: '-',
    jsonHelpHeaders: '这里填 JSON 对象，比如 {"Authorization":"Bearer xxx"}',
    jsonHelpGlobalExtraBody: '填 JSON 对象，例如 {"provider":{"cache":true}}',
    jsonHelpProviderExtraBody: '填 JSON 对象，适合上游专属参数',
    valueHelp: '支持 number / true / false / null / string',
    helpHost: '服务监听地址。开发时一般用 0.0.0.0，表示允许局域网或容器访问。',
    helpPort: '服务监听端口。默认 8000。',
    helpTtl: '模型列表缓存时长，单位秒。值越大，请求 /v1/models 越少。',
    helpTruncatePromptChars: '调试日志里 prompt 的截断长度，避免日志太长。',
    helpBaseUrl: '上游模型服务地址，例如 http://host.docker.internal:11434 或 http://127.0.0.1:30003',
    helpApiKey: '如果上游需要鉴权就在这里填，不需要可留空。',
    helpTimeout: '请求该 upstream 的超时时间，单位秒。',
    helpModelsPath: '用于拉取模型列表的接口路径，通常是 /v1/models。',
    helpHeaders: '额外请求头，填 JSON 对象。适合放固定鉴权头或特殊上游要求的 header。',
    helpUpstreamName: 'upstream 的唯一名字，routing 和 alias 都会引用它。',
    helpAliasName: '对外暴露给客户端的模型别名。客户端请求这个名字时会映射到 target model。',
    helpTargetModel: '实际转发给上游的模型名，例如 Qwen/Qwen3.5-27B-FP8。',
    helpPathRule: '把特定 API 路径定向到某个 upstream，例如 /v1/embeddings。',
    helpOverrideKey: '要覆盖的参数名，例如 temperature、top_p、top_k。',
    helpOverrideValue: 'override 的值。支持数字、true/false、null、字符串。',
    helpExtraBody: '附加到请求体中的额外字段，填 JSON 对象。适合 provider 专属参数。',
    selectHelpOverrideMode: 'default：仅在用户没传该参数时补默认值；force：强制覆盖用户传值；remove：删除该参数。',
    selectHelpDefaultUpstream: '当模型没命中 alias 或路径规则时，默认转发到这里。',
    selectHelpTargetUpstream: 'alias 命中后，请求会转发到这里。',
    selectHelpRouteUpstream: '这条 path rule 命中后，请求会转发到这里。',
  },
  en: {
    appTitle: 'OpenAI Wrapper Config UI',
    loading: 'Loading...',
    formMode: 'Form Mode',
    rawMode: 'Raw YAML',
    reload: 'Reload',
    save: 'Save Config',
    themeLight: 'Switch to Light',
    themeDark: 'Switch to Dark',
    themeLightShort: 'Light',
    themeDarkShort: 'Dark',
    languageZh: '中文',
    languageEn: 'English',
    statusLoadingConfig: 'Loading config...',
    statusConfigLoaded: 'Config loaded',
    statusSavingConfig: 'Saving config...',
    statusSaveSuccess: 'Saved successfully',
    statusSaveFailed: 'Save failed: {message}',
    statusLoadFailed: 'Load failed: {message}',
    statusPreviewLoading: 'Previewing final /v1/models ...',
    statusPreviewUpdated: 'Models preview updated',
    statusPreviewFailed: 'Models preview failed: {message}',
    statusUpstreamTestDone: 'Upstream {name} test finished',
    statusUpstreamTestFailed: 'Upstream test failed: {message}',
    selectPlaceholder: 'Please select',
    sectionBasic: 'Basic Settings',
    sectionUpstreams: 'Upstreams',
    sectionRouting: 'Routing',
    sectionGlobalOverrides: 'Global Overrides / Extra Body',
    sectionAliases: 'Aliases',
    sectionPreview: 'Public /v1/models Preview',
    sectionOverrides: 'Overrides',
    sectionExtraBody: 'Extra Body',
    fieldHost: 'Host',
    fieldPort: 'Port',
    fieldModelsCacheTtl: 'Models Cache TTL (seconds)',
    fieldTruncatePromptChars: 'Prompt Log Truncation',
    fieldLogFinalPayload: 'Log final payload',
    fieldLogHeaders: 'Log headers',
    fieldName: 'Name',
    fieldBaseUrl: 'Base URL',
    fieldApiKey: 'API Key',
    fieldTimeout: 'Timeout',
    fieldModelsPath: 'Models Path',
    fieldEnabled: 'Enabled',
    fieldHeadersJson: 'Headers (JSON)',
    fieldDefaultUpstream: 'Default Upstream',
    fieldPath: 'Path',
    fieldUpstream: 'Upstream',
    fieldParamName: 'Parameter',
    fieldMode: 'Mode',
    fieldValue: 'Value',
    fieldExtraBodyJson: 'Extra Body (JSON)',
    fieldAliasName: 'Alias Name',
    fieldTargetUpstream: 'Target Upstream',
    fieldTargetModel: 'Target Model',
    btnDelete: 'Delete',
    btnAddUpstream: 'Add upstream',
    btnTestUpstream: 'Test / Fetch Models',
    btnAddRouteRule: 'Add route rule',
    btnDeleteRouteRule: 'Delete rule',
    btnAddOverride: 'Add override',
    btnDeleteOverride: 'Delete override',
    btnAddAlias: 'Add alias',
    btnPreviewModels: 'Preview final model list',
    rawEditorLabel: 'Raw YAML',
    globalChatOverrides: 'global_chat_overrides',
    globalExtraBody: 'global_extra_body',
    noUpstreamTestYet: 'No test result yet. Click “Test / Fetch Models” to load the upstream model list here.',
    upstreamTesting: 'Testing upstream...',
    upstreamTestSuccess: 'Test succeeded{status}',
    upstreamTestFailed: 'Test failed{status}',
    upstreamModelsFound: 'Found {count} models',
    noModelOptionsYet: 'No model options for this upstream yet. Test that upstream above first, or type manually.',
    modelOptionsReady: '{count} model options available. You can still type manually.',
    noPreviewYet: 'No preview yet. Click the button above to see which models the wrapper will expose publicly.',
    previewGenerating: 'Generating preview...',
    previewFailed: 'Preview failed',
    previewSummary: 'The wrapper will expose {count} models',
    previewTableModel: 'Model',
    previewTableSource: 'Source',
    previewTableUpstream: 'Upstream',
    previewTableTargetModel: 'Target Model',
    previewRawPayload: 'View raw models payload',
    sourceAlias: 'alias',
    sourceUpstream: 'upstream',
    unnamedUpstream: 'Upstream {index}',
    unnamedAlias: 'Alias {index}',
    dash: '-',
    jsonHelpHeaders: 'Enter a JSON object here, for example {"Authorization":"Bearer xxx"}.',
    jsonHelpGlobalExtraBody: 'Enter a JSON object, for example {"provider":{"cache":true}}.',
    jsonHelpProviderExtraBody: 'Enter a JSON object for provider-specific fields.',
    valueHelp: 'Supports number / true / false / null / string',
    helpHost: 'Server bind address. 0.0.0.0 is typical for local network or container access.',
    helpPort: 'Server listen port. Default is 8000.',
    helpTtl: 'Model list cache TTL in seconds. Higher values reduce /v1/models calls.',
    helpTruncatePromptChars: 'Truncation length for prompts in debug logs to avoid huge log entries.',
    helpBaseUrl: 'Upstream model service URL, such as http://host.docker.internal:11434 or http://127.0.0.1:30003',
    helpApiKey: 'Set this if the upstream requires authentication. Leave empty otherwise.',
    helpTimeout: 'Timeout in seconds when requesting this upstream.',
    helpModelsPath: 'Endpoint path used to fetch the upstream model list, usually /v1/models.',
    helpHeaders: 'Extra request headers as a JSON object. Useful for fixed auth headers or upstream-specific requirements.',
    helpUpstreamName: 'Unique upstream name referenced by routing and aliases.',
    helpAliasName: 'Public model alias exposed to clients. Requests using this name will map to the target model.',
    helpTargetModel: 'Real model name forwarded to the upstream, for example Qwen/Qwen3.5-27B-FP8.',
    helpPathRule: 'Route a specific API path to an upstream, for example /v1/embeddings.',
    helpOverrideKey: 'Parameter name to override, such as temperature, top_p, or top_k.',
    helpOverrideValue: 'Override value. Supports numbers, true/false, null, and strings.',
    helpExtraBody: 'Extra fields merged into the request body as a JSON object. Useful for provider-specific parameters.',
    selectHelpOverrideMode: 'default: fill only when the user did not send the field; force: always overwrite; remove: delete the field.',
    selectHelpDefaultUpstream: 'Used when no alias or path rule matches the request.',
    selectHelpTargetUpstream: 'Requests matching this alias will be sent to this upstream.',
    selectHelpRouteUpstream: 'Requests matching this path rule will be sent to this upstream.',
  },
};

const state = {
  mode: 'form',
  path: '',
  raw: '',
  data: {},
  meta: {},
  upstreamTests: {},
  preview: null,
  ui: {
    theme: loadStoredTheme(),
    locale: loadStoredLocale(),
  },
  draftInputs: {},
};

const els = {
  body: document.body,
  appTitle: document.getElementById('app-title'),
  formMode: document.getElementById('form-mode'),
  rawMode: document.getElementById('raw-mode'),
  rawEditor: document.getElementById('raw-editor'),
  rawEditorLabel: document.getElementById('raw-editor-label'),
  status: document.getElementById('status'),
  configPath: document.getElementById('config-path'),
  formModeBtn: document.getElementById('form-mode-btn'),
  rawModeBtn: document.getElementById('raw-mode-btn'),
  reloadBtn: document.getElementById('reload-btn'),
  saveBtn: document.getElementById('save-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  localeSelect: document.getElementById('locale-select'),
};

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage failures; UI should still work without persistence
  }
}

function loadStoredTheme() {
  const stored = safeStorageGet(STORAGE_KEYS.theme);
  return stored === 'dark' ? 'dark' : 'light';
}

function loadStoredLocale() {
  const stored = safeStorageGet(STORAGE_KEYS.locale);
  return stored === 'en' ? 'en' : 'zh-CN';
}

function t(key, vars = {}) {
  const dict = I18N[state.ui.locale] || I18N['zh-CN'];
  let text = dict[key] ?? I18N['zh-CN'][key] ?? key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

function help(key) {
  return t(key);
}

function applyUiPrefs() {
  els.body.dataset.theme = state.ui.theme;
  els.body.dataset.locale = state.ui.locale;
  document.documentElement.lang = state.ui.locale;
  els.appTitle.textContent = t('appTitle');
  els.formModeBtn.textContent = t('formMode');
  els.rawModeBtn.textContent = t('rawMode');
  els.reloadBtn.textContent = t('reload');
  els.saveBtn.textContent = t('save');
  els.rawEditorLabel.textContent = t('rawEditorLabel');
  els.themeToggleBtn.textContent = state.ui.theme === 'dark' ? t('themeLightShort') : t('themeDarkShort');
  els.themeToggleBtn.setAttribute('aria-label', state.ui.theme === 'dark' ? t('themeLight') : t('themeDark'));
  els.localeSelect.innerHTML = '';
  [{ value: 'zh-CN', label: t('languageZh') }, { value: 'en', label: t('languageEn') }].forEach((item) => {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    if (item.value === state.ui.locale) option.selected = true;
    els.localeSelect.appendChild(option);
  });
}

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
  setStatus(t('statusLoadingConfig'), 'ok');
  const payload = await requestJson('/api/ui/config');
  state.path = payload.path;
  state.raw = payload.raw;
  state.data = payload.data;
  state.meta = payload.meta || {};
  state.upstreamTests = {};
  state.preview = null;
  state.draftInputs = {};
  els.configPath.textContent = payload.path;
  els.rawEditor.value = state.raw;
  render();
  setStatus(t('statusConfigLoaded'), 'ok');
}

function render() {
  applyUiPrefs();
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
    option.textContent = optionValue || t('selectPlaceholder');
    if ((value ?? '') === optionValue) option.selected = true;
    select.appendChild(option);
  });
  select.onchange = (e) => oninput(e.target.value);
  div.appendChild(select);
  if (config.selectHelp) {
    const helpText = document.createElement('div');
    helpText.className = 'select-help';
    helpText.textContent = config.selectHelp;
    div.appendChild(helpText);
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
    const helpText = document.createElement('div');
    helpText.className = 'select-help';
    helpText.textContent = config.selectHelp;
    div.appendChild(helpText);
  }
  return div;
}

function textareaField(label, value, oninput, helpText = '', tooltip = '', options = {}) {
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
  if (options.draftKey && Object.prototype.hasOwnProperty.call(state.draftInputs, options.draftKey)) {
    ta.value = state.draftInputs[options.draftKey];
  } else {
    ta.value = value ?? '';
  }
  ta.oninput = (e) => {
    if (options.draftKey) state.draftInputs[options.draftKey] = e.target.value;
    oninput(e.target.value);
  };
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
  const section = wrapSection(t('sectionBasic'));
  const grid = document.createElement('div');
  grid.className = 'grid';
  const server = state.data.server || {};
  const debug = state.data.debug || {};
  grid.append(
    textField(t('fieldHost'), server.host || '', (v) => { server.host = v; }, 'text', { tooltip: help('helpHost') }),
    textField(t('fieldPort'), server.port ?? 8000, (v) => { server.port = Number(v || 0); }, 'number', { tooltip: help('helpPort') }),
    textField(t('fieldModelsCacheTtl'), state.data.models_cache_ttl_seconds ?? 60, (v) => { state.data.models_cache_ttl_seconds = Number(v || 0); }, 'number', { tooltip: help('helpTtl') }),
    textField(t('fieldTruncatePromptChars'), debug.truncate_prompt_chars ?? 500, (v) => { debug.truncate_prompt_chars = Number(v || 0); }, 'number', { tooltip: help('helpTruncatePromptChars') }),
    checkboxField(t('fieldLogFinalPayload'), debug.log_final_payload, (v) => { debug.log_final_payload = v; }),
    checkboxField(t('fieldLogHeaders'), debug.log_headers, (v) => { debug.log_headers = v; }),
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
    setStatus(t('statusUpstreamTestDone', { name: item.name || index + 1 }), payload.ok ? 'ok' : 'error');
  } catch (err) {
    state.upstreamTests[key] = { ok: false, error: err.message, model_ids: [] };
    setStatus(t('statusUpstreamTestFailed', { message: err.message }), 'error');
  }
  render();
}

function renderUpstreamTestResult(item, index) {
  const key = getTestKey(item, index);
  const result = state.upstreamTests[item.name] || state.upstreamTests[key];
  const box = document.createElement('div');
  box.className = 'test-result muted';
  if (!result) {
    box.textContent = t('noUpstreamTestYet');
    return box;
  }
  if (result.loading) {
    box.textContent = t('upstreamTesting');
    return box;
  }
  box.className = `test-result ${result.ok ? 'ok' : 'error'}`;
  const lines = [];
  const statusSuffix = result.status_code ? ` (${result.status_code})` : '';
  lines.push(result.ok ? t('upstreamTestSuccess', { status: statusSuffix }) : t('upstreamTestFailed', { status: statusSuffix }));
  if (result.error) lines.push(result.error);
  if (result.ok) {
    lines.push(t('upstreamModelsFound', { count: result.model_ids?.length || 0 }));
    if (result.model_ids?.length) lines.push(result.model_ids.join('\n'));
  }
  box.textContent = lines.join('\n');
  return box;
}

function renderUpstreamsSection() {
  const section = wrapSection(t('sectionUpstreams'));
  const list = state.data.upstreams || (state.data.upstreams = []);

  list.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const head = document.createElement('div');
    head.className = 'card-head';
    const title = document.createElement('strong');
    title.textContent = item.name || t('unnamedUpstream', { index: index + 1 });
    head.appendChild(title);
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    const testBtn = document.createElement('button');
    testBtn.textContent = t('btnTestUpstream');
    testBtn.onclick = () => testUpstream(item, index);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = t('btnDelete');
    del.onclick = () => { list.splice(index, 1); render(); };
    actions.append(testBtn, del);
    head.appendChild(actions);
    card.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.append(
      textField(t('fieldName'), item.name || '', (v) => { item.name = v; }, 'text', { tooltip: help('helpUpstreamName') }),
      textField(t('fieldBaseUrl'), item.base_url || '', (v) => { item.base_url = v; }, 'text', { tooltip: help('helpBaseUrl') }),
      textField(t('fieldApiKey'), item.api_key || '', (v) => { item.api_key = v; }, 'text', { tooltip: help('helpApiKey') }),
      textField(t('fieldTimeout'), item.timeout ?? 120, (v) => { item.timeout = Number(v || 0); }, 'number', { tooltip: help('helpTimeout') }),
      textField(t('fieldModelsPath'), item.models_path || '/v1/models', (v) => { item.models_path = v; }, 'text', { tooltip: help('helpModelsPath') }),
      checkboxField(t('fieldEnabled'), item.enabled !== false, (v) => { item.enabled = v; }),
      textareaField(t('fieldHeadersJson'), jsonText(item.headers || {}), (v) => { item.headers = safeJsonParse(v, {}); }, t('jsonHelpHeaders'), help('helpHeaders'), { draftKey: `upstream:${index}:headers` }),
    );
    card.appendChild(grid);
    card.appendChild(renderUpstreamTestResult(item, index));
    section.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = t('btnAddUpstream');
  addBtn.onclick = () => {
    list.push({ name: '', base_url: '', api_key: '', timeout: 120, enabled: true, models_path: '/v1/models', headers: {} });
    render();
  };
  section.appendChild(addBtn);
  return section;
}

function renderRoutingSection() {
  const section = wrapSection(t('sectionRouting'));
  const routing = state.data.routing || (state.data.routing = { default_upstream: '', path_rules: {} });
  const upstreamNames = getUpstreamNames();
  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.append(selectField(t('fieldDefaultUpstream'), routing.default_upstream || '', upstreamNames, (v) => { routing.default_upstream = v; }, { selectHelp: help('selectHelpDefaultUpstream') }));
  section.appendChild(grid);

  const rules = Object.entries(routing.path_rules || {});
  rules.forEach(([path, upstream], index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const nextRules = Object.entries(routing.path_rules || {});
    const ruleGrid = document.createElement('div');
    ruleGrid.className = 'grid';
    ruleGrid.append(
      textField(t('fieldPath'), path, (v) => {
        nextRules[index][0] = v;
        routing.path_rules = Object.fromEntries(nextRules.filter(([p, u]) => p && u));
      }, 'text', { tooltip: help('helpPathRule') }),
      selectField(t('fieldUpstream'), upstream, upstreamNames, (v) => {
        nextRules[index][1] = v;
        routing.path_rules = Object.fromEntries(nextRules.filter(([p, u]) => p && u));
      }, { selectHelp: help('selectHelpRouteUpstream') })
    );
    card.appendChild(ruleGrid);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = t('btnDeleteRouteRule');
    del.onclick = () => {
      nextRules.splice(index, 1);
      routing.path_rules = Object.fromEntries(nextRules);
      render();
    };
    card.appendChild(del);
    section.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = t('btnAddRouteRule');
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
  const section = wrapSection(t('sectionGlobalOverrides'));
  const overrides = state.data.global_chat_overrides || (state.data.global_chat_overrides = {});
  const overrideEntries = normalizeOverrideEntries(overrides);

  const overridesWrap = document.createElement('div');
  overridesWrap.className = 'section';
  const overridesTitle = document.createElement('div');
  overridesTitle.className = 'section-title';
  overridesTitle.textContent = t('globalChatOverrides');
  overridesWrap.appendChild(overridesTitle);

  overrideEntries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.append(
      textField(t('fieldParamName'), entry.key || '', (v) => {
        overrideEntries[index].key = v;
        state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      }, 'text', { tooltip: help('helpOverrideKey') }),
      selectField(t('fieldMode'), entry.mode || 'default', ['default', 'force', 'remove'], (v) => {
        overrideEntries[index].mode = v;
        state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      }, { selectHelp: help('selectHelpOverrideMode') }),
      textField(t('fieldValue'), entry.value ?? '', (v) => {
        overrideEntries[index].value = v;
        state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      }, 'text', { tooltip: help('helpOverrideValue'), helpText: t('valueHelp') })
    );
    card.appendChild(grid);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = t('btnDeleteOverride');
    del.onclick = () => {
      overrideEntries.splice(index, 1);
      state.data.global_chat_overrides = denormalizeOverrideEntries(overrideEntries);
      render();
    };
    card.appendChild(del);
    overridesWrap.appendChild(card);
  });

  const addOverrideBtn = document.createElement('button');
  addOverrideBtn.textContent = t('btnAddOverride');
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
  extraTitle.textContent = t('globalExtraBody');
  extraBodyWrap.appendChild(extraTitle);
  extraBodyWrap.appendChild(
    textareaField(t('fieldExtraBodyJson'), jsonText(state.data.global_extra_body || {}), (v) => { state.data.global_extra_body = safeJsonParse(v, {}); }, t('jsonHelpGlobalExtraBody'), help('helpExtraBody'), { draftKey: 'global_extra_body' })
  );

  section.append(overridesWrap, extraBodyWrap);
  return section;
}

function renderAliasesSection() {
  const section = wrapSection(t('sectionAliases'));
  const list = state.data.aliases || (state.data.aliases = []);
  const upstreamNames = getUpstreamNames();

  list.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const head = document.createElement('div');
    head.className = 'card-head';
    const title = document.createElement('strong');
    title.textContent = item.name || t('unnamedAlias', { index: index + 1 });
    head.appendChild(title);
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = t('btnDelete');
    del.onclick = () => { list.splice(index, 1); render(); };
    head.appendChild(del);
    card.appendChild(head);

    const modelOptions = getUpstreamModels(item.upstream);
    const baseGrid = document.createElement('div');
    baseGrid.className = 'grid';
    baseGrid.append(
      textField(t('fieldAliasName'), item.name || '', (v) => { item.name = v; }, 'text', { tooltip: help('helpAliasName') }),
      selectField(t('fieldTargetUpstream'), item.upstream || '', upstreamNames, (v) => { item.upstream = v; render(); }, { selectHelp: help('selectHelpTargetUpstream') }),
      datalistField(t('fieldTargetModel'), item.target_model || '', modelOptions, (v) => { item.target_model = v; }, {
        tooltip: help('helpTargetModel'),
        selectHelp: modelOptions.length ? t('modelOptionsReady', { count: modelOptions.length }) : t('noModelOptionsYet'),
      }),
    );
    card.appendChild(baseGrid);

    const overridesSection = document.createElement('div');
    overridesSection.className = 'section';
    const overridesTitle = document.createElement('div');
    overridesTitle.className = 'section-title';
    overridesTitle.textContent = t('sectionOverrides');
    overridesSection.appendChild(overridesTitle);

    const overrideEntries = normalizeOverrideEntries(item.overrides || {});
    overrideEntries.forEach((entry, overrideIndex) => {
      const overrideCard = document.createElement('div');
      overrideCard.className = 'card';
      const overrideGrid = document.createElement('div');
      overrideGrid.className = 'grid';
      overrideGrid.append(
        textField(t('fieldParamName'), entry.key || '', (v) => {
          overrideEntries[overrideIndex].key = v;
          item.overrides = denormalizeOverrideEntries(overrideEntries);
        }, 'text', { tooltip: help('helpOverrideKey') }),
        selectField(t('fieldMode'), entry.mode || 'default', ['default', 'force', 'remove'], (v) => {
          overrideEntries[overrideIndex].mode = v;
          item.overrides = denormalizeOverrideEntries(overrideEntries);
        }, { selectHelp: help('selectHelpOverrideMode') }),
        textField(t('fieldValue'), entry.value ?? '', (v) => {
          overrideEntries[overrideIndex].value = v;
          item.overrides = denormalizeOverrideEntries(overrideEntries);
        }, 'text', { tooltip: help('helpOverrideValue'), helpText: t('valueHelp') })
      );
      overrideCard.appendChild(overrideGrid);
      const delOverride = document.createElement('button');
      delOverride.className = 'danger';
      delOverride.textContent = t('btnDeleteOverride');
      delOverride.onclick = () => {
        overrideEntries.splice(overrideIndex, 1);
        item.overrides = denormalizeOverrideEntries(overrideEntries);
        render();
      };
      overrideCard.appendChild(delOverride);
      overridesSection.appendChild(overrideCard);
    });

    const addOverrideBtn = document.createElement('button');
    addOverrideBtn.textContent = t('btnAddOverride');
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
    extraBodyTitle.textContent = t('sectionExtraBody');
    extraBodySection.appendChild(extraBodyTitle);
    extraBodySection.appendChild(
      textareaField(t('fieldExtraBodyJson'), jsonText(item.extra_body || {}), (v) => { item.extra_body = safeJsonParse(v, {}); }, t('jsonHelpProviderExtraBody'), help('helpExtraBody'), { draftKey: `alias:${index}:extra_body` })
    );
    card.appendChild(extraBodySection);

    section.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = t('btnAddAlias');
  addBtn.onclick = () => {
    list.push({ name: '', upstream: '', target_model: '', overrides: {}, extra_body: {} });
    render();
  };
  section.appendChild(addBtn);
  return section;
}

async function previewModels() {
  try {
    setStatus(t('statusPreviewLoading'), 'ok');
    state.preview = { loading: true };
    render();
    const payload = await requestJson('/api/ui/models/preview', {
      method: 'POST',
      body: JSON.stringify({ data: state.data }),
    });
    state.preview = payload;
    render();
    setStatus(t('statusPreviewUpdated'), 'ok');
  } catch (err) {
    state.preview = { ok: false, error: err.message, items: [] };
    render();
    setStatus(t('statusPreviewFailed', { message: err.message }), 'error');
  }
}

function renderModelsPreviewSection() {
  const section = wrapSection(t('sectionPreview'));
  const actions = document.createElement('div');
  actions.className = 'row-actions';
  const previewBtn = document.createElement('button');
  previewBtn.textContent = t('btnPreviewModels');
  previewBtn.onclick = previewModels;
  actions.appendChild(previewBtn);
  section.appendChild(actions);

  const preview = state.preview;
  const box = document.createElement('div');
  if (!preview) {
    box.className = 'test-result muted';
    box.textContent = t('noPreviewYet');
    section.appendChild(box);
    return section;
  }
  if (preview.loading) {
    box.className = 'test-result muted';
    box.textContent = t('previewGenerating');
    section.appendChild(box);
    return section;
  }
  if (!preview.ok) {
    box.className = 'test-result error';
    box.textContent = preview.error || t('previewFailed');
    section.appendChild(box);
    return section;
  }

  const summary = document.createElement('div');
  summary.className = 'test-result ok';
  summary.textContent = t('previewSummary', { count: preview.items?.length || 0 });
  section.appendChild(summary);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';
  const table = document.createElement('table');
  table.className = 'preview-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  [t('previewTableModel'), t('previewTableSource'), t('previewTableUpstream'), t('previewTableTargetModel')].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  (preview.items || []).forEach((item) => {
    const tr = document.createElement('tr');
    const sourceText = item.source === 'alias' ? t('sourceAlias') : t('sourceUpstream');
    [item.id || '', sourceText, item.upstream || t('dash'), item.target_model || t('dash')].forEach((text) => {
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
  summaryEl.textContent = t('previewRawPayload');
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
    setStatus(t('statusSavingConfig'), 'ok');
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
    setStatus(t('statusSaveSuccess'), 'ok');
    if (state.mode === 'form') {
      await previewModels();
    }
  } catch (err) {
    setStatus(t('statusSaveFailed', { message: err.message }), 'error');
  }
}

function setTheme(theme) {
  state.ui.theme = theme === 'dark' ? 'dark' : 'light';
  safeStorageSet(STORAGE_KEYS.theme, state.ui.theme);
  render();
}

function setLocale(locale) {
  state.ui.locale = locale === 'en' ? 'en' : 'zh-CN';
  safeStorageSet(STORAGE_KEYS.locale, state.ui.locale);
  render();
}

els.formModeBtn.onclick = () => { state.mode = 'form'; render(); };
els.rawModeBtn.onclick = () => { state.mode = 'raw'; render(); };
els.reloadBtn.onclick = async () => {
  try { await loadConfig(); } catch (err) { setStatus(t('statusLoadFailed', { message: err.message }), 'error'); }
};
els.saveBtn.onclick = saveConfig;
els.themeToggleBtn.onclick = () => setTheme(state.ui.theme === 'dark' ? 'light' : 'dark');
els.localeSelect.onchange = (e) => setLocale(e.target.value);

applyUiPrefs();
loadConfig().catch((err) => setStatus(t('statusLoadFailed', { message: err.message }), 'error'));
