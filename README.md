# OpenAI Wrapper

一个基于 FastAPI 的 OpenAI 兼容代理层，面向本地部署的 Ollama / sglang。

## 功能

- 完整支持 `/v1/chat/completions`
- 支持流式与非流式转发
- 支持参数覆盖（default / force / remove）
- 支持 `extra_body` 注入，且**用户字段优先**
- 支持 `/v1/models` 聚合多个上游模型列表
- 支持模型 alias
- 其余 `/v1/*` 接口默认透传
- 支持 Docker 部署

## 快速开始

### 本地运行

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker

```bash
docker compose up --build -d
```

## 配置

编辑 `config.yaml`：

- `upstreams`: 定义 ollama / sglang 等上游
- `routing`: 默认上游与路径路由规则
- `global_chat_overrides`: 全局 chat 参数覆盖
- `global_extra_body`: 全局额外字段
- `aliases`: 模型别名及专属覆盖规则

## 行为说明

### chat/completions

1. 命中 alias 时，先映射到目标模型和目标上游
2. 应用 alias overrides
3. 合并 alias extra_body（用户字段优先）
4. 应用 global overrides
5. 合并 global extra_body（用户字段优先）
6. 转发到上游

### models

- 聚合所有启用上游的 `/v1/models`
- 去重
- 追加 alias 作为 wrapper 自己暴露的模型名
- 默认缓存 60 秒

## 注意

- Docker 中访问宿主机服务默认使用 `host.docker.internal`
- Linux 下已在 compose 中加入 `host-gateway`
- 如果上游不需要 API Key，可留空
