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
python -m app.main
```

说明：
- `python -m app.main` 会读取 `config.yaml` 中的 `server.host` 和 `server.port`
- 如果你改用 `uvicorn app.main:app` 直接启动，那 host/port 仍由 uvicorn 命令行参数决定，不会自动读取配置文件
- 仓库内提供 `config.example.yaml` 作为示例，请先复制为本地 `config.yaml` 再修改
- Docker 镜像构建时会内置 `config.example.yaml`；生产部署时建议通过挂载提供你自己的 `/app/config.yaml`

### Docker

```bash
docker compose up --build -d
```

如果你直接运行容器，建议把宿主机配置文件挂载到容器内：

```bash
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/config.yaml:/app/config.yaml \
  robitai/openai-wrapper:latest
```

## WebUI

项目内置了一个简单的配置管理 WebUI，用来查看和编辑当前的 `config.yaml`，不需要额外安装前端项目。

### 访问地址

服务启动后，直接打开：

- `http://127.0.0.1:8000/ui`
- 如果你改了 `config.yaml` 里的 `server.port`，把上面的 `8000` 换成对应端口

### WebUI 能做什么

- 查看当前加载的配置文件路径
- 以表单模式编辑 `server / routing / upstreams / aliases` 等配置
- 切换到 Raw YAML 模式直接编辑原始配置
- 保存后立即刷新运行时配置，无需手动重启进程

### 使用方式

1. 先按上面的“本地运行”或 “Docker” 启动服务
2. 确保项目根目录下已经有 `config.yaml`
3. 浏览器打开 `/ui`
4. 在表单模式或 Raw YAML 模式下修改配置并保存

### Docker 下使用 WebUI

如果你用的是仓库里的 `docker-compose.yml`，启动后同样访问：

- `http://127.0.0.1:8000/ui`

注意：compose 默认把宿主机的 `./config.yaml` 挂载到容器内 `/app/config.yaml`，所以你在 WebUI 里保存的其实就是宿主机这份配置文件。

### 注意事项

- WebUI 当前主要用于配置管理，不是聊天测试界面
- WebUI 依赖项目后端服务本身，没有单独的前端 dev server
- 如果打开 `/ui` 报配置文件不存在，请先执行：

```bash
cp config.example.yaml config.yaml
```

## 配置

先复制一份本地配置：

```bash
cp config.example.yaml config.yaml
```

然后编辑 `config.yaml`：

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
