# OpenAI Wrapper

An OpenAI-compatible proxy built with FastAPI for locally deployed Ollama / sglang backends.

## Features

- Full support for `/v1/chat/completions`
- Supports both streaming and non-streaming forwarding
- Supports parameter overrides (`default` / `force` / `remove`)
- Supports `extra_body` injection with **user-provided fields taking precedence**
- Supports aggregating model lists from multiple upstreams via `/v1/models`
- Supports model aliases
- Passes through other `/v1/*` endpoints by default
- Supports Docker deployment

## Quick Start

### Run Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

Notes:
- `python -m app.main` reads `server.host` and `server.port` from `config.yaml`
- If you start it with `uvicorn app.main:app`, host/port are controlled by the uvicorn CLI arguments instead of the config file
- The repository includes `config.example.yaml` as a sample. Copy it to `config.yaml` before editing
- The Docker image includes `config.example.yaml`; for production deployments, it is recommended to mount your own `/app/config.yaml`

### Docker

```bash
docker compose up --build -d
```

If you run the container directly, it is recommended to mount the config file from the host:

```bash
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/config.yaml:/app/config.yaml \
  robitai/openai-wrapper:latest
```

## WebUI

The project includes a built-in WebUI for viewing and editing `config.yaml`. No separate frontend project is required.

### Access URL

After the service starts, open:

- `http://127.0.0.1:8000/ui`
- If you changed `server.port` in `config.yaml`, replace `8000` with your configured port

### What the WebUI Can Do

- Show the path of the currently loaded config file
- Edit `server / routing / upstreams / aliases` and other settings in form mode
- Switch to Raw YAML mode to edit the config directly
- Save changes and refresh the runtime config immediately without manually restarting the process

### How to Use It

1. Start the service using either the local or Docker method above
2. Make sure `config.yaml` exists in the project root
3. Open `/ui` in your browser
4. Edit the configuration in either form mode or Raw YAML mode, then save

### Using the WebUI with Docker

If you use the repository's `docker-compose.yml`, the WebUI is available at:

- `http://127.0.0.1:8000/ui`

Note: the compose file mounts the host's `./config.yaml` into the container as `/app/config.yaml`, so saving changes in the WebUI updates the host-side config file.

### Notes

- The current WebUI is intended for configuration management, not as a chat playground
- The WebUI is served by the backend itself; there is no separate frontend dev server
- If `/ui` reports that the config file does not exist, run:

```bash
cp config.example.yaml config.yaml
```

## Configuration

First, create a local config file:

```bash
cp config.example.yaml config.yaml
```

Then edit `config.yaml`:

- `upstreams`: defines upstream backends such as Ollama / sglang
- `routing`: default upstream and path-based routing rules
- `global_chat_overrides`: global chat parameter overrides
- `global_extra_body`: global extra fields
- `aliases`: model aliases and alias-specific override rules

## Behavior

### chat/completions

1. If an alias matches, map it to the target model and target upstream first
2. Apply alias overrides
3. Merge alias `extra_body` (user-provided fields take precedence)
4. Apply global overrides
5. Merge global `extra_body` (user-provided fields take precedence)
6. Forward the request to the upstream

### models

- Aggregates `/v1/models` from all enabled upstreams
- Deduplicates model entries
- Appends aliases as model names exposed by the wrapper itself
- Uses a default cache TTL of 60 seconds

## Notes

- Inside Docker, access to host services usually uses `host.docker.internal`
- On Linux, `host-gateway` is already included in the compose file
- If an upstream does not require an API key, you can leave it empty

## Language Versions

- English: `README.md`
- Chinese: `README_zh.md`
