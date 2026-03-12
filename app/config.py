from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field


class OverrideRule(BaseModel):
    mode: str = Field(default="default")
    value: Any = None


class UpstreamConfig(BaseModel):
    base_url: str
    api_key: str = ""
    timeout: float = 120.0
    enabled: bool = True
    models_path: str = "/v1/models"
    headers: dict[str, str] = Field(default_factory=dict)


class AliasConfig(BaseModel):
    upstream: str
    target_model: str
    overrides: dict[str, OverrideRule] = Field(default_factory=dict)
    extra_body: dict[str, Any] = Field(default_factory=dict)


class RoutingConfig(BaseModel):
    default_upstream: str
    path_rules: dict[str, str] = Field(default_factory=dict)


class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000


class DebugConfig(BaseModel):
    log_final_payload: bool = False
    log_headers: bool = False
    truncate_prompt_chars: int = 500


class AppConfig(BaseModel):
    server: ServerConfig = Field(default_factory=ServerConfig)
    debug: DebugConfig = Field(default_factory=DebugConfig)
    routing: RoutingConfig
    upstreams: dict[str, UpstreamConfig]
    global_chat_overrides: dict[str, OverrideRule] = Field(default_factory=dict)
    global_extra_body: dict[str, Any] = Field(default_factory=dict)
    aliases: dict[str, AliasConfig] = Field(default_factory=dict)
    models_cache_ttl_seconds: int = 60


DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.yaml"


@lru_cache(maxsize=1)
def load_config(config_path: str | None = None) -> AppConfig:
    path = Path(config_path or DEFAULT_CONFIG_PATH)
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return AppConfig.model_validate(data)
