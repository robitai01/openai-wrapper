from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Literal

import yaml
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from app.config import DEFAULT_CONFIG_PATH, load_config
from app.routers.chat import model_registry as chat_model_registry
from app.routers.models import model_registry as models_model_registry

router = APIRouter()
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
CONFIG_PATH = DEFAULT_CONFIG_PATH
SUPPORTED_UPSTREAM_KINDS = ["openai-compatible", "ollama", "sglang"]


class ConfigSaveRequest(BaseModel):
    mode: Literal["form", "raw"]
    data: dict[str, Any] | None = None
    raw: str | None = None


class ConfigLoadResponse(BaseModel):
    path: str
    raw: str
    data: dict[str, Any]
    meta: dict[str, Any] = Field(default_factory=dict)


@router.get("/ui", response_class=HTMLResponse)
async def ui_page(request: Request):
    return templates.TemplateResponse("ui.html", {"request": request})


@router.get("/api/ui/config")
async def get_ui_config():
    payload = build_payload_from_disk()
    return JSONResponse(payload)


@router.post("/api/ui/config")
async def save_ui_config(request_body: ConfigSaveRequest):
    try:
        if request_body.mode == "raw":
            raw = request_body.raw or ""
            parsed = yaml.safe_load(raw) or {}
            if not isinstance(parsed, dict):
                raise HTTPException(status_code=400, detail="Raw YAML must parse to an object")
            validate_config_dict(parsed)
            save_config_raw(raw)
        else:
            if request_body.data is None:
                raise HTTPException(status_code=400, detail="Missing form data")
            original = read_config_dict()
            updated = merge_form_data(original, request_body.data)
            validate_config_dict(updated)
            save_config_dict(updated)
    except HTTPException:
        raise
    except yaml.YAMLError as exc:
        raise HTTPException(status_code=400, detail=f"YAML parse error: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    payload = build_payload_from_disk()
    return JSONResponse({"ok": True, "message": "Config saved successfully", **payload})


def read_config_dict() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        raise HTTPException(status_code=404, detail=f"Config file not found: {CONFIG_PATH}")
    data = yaml.safe_load(CONFIG_PATH.read_text(encoding="utf-8")) or {}
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Config root must be an object")
    return data


def build_payload_from_disk() -> dict[str, Any]:
    data = read_config_dict()
    raw = CONFIG_PATH.read_text(encoding="utf-8")
    form_data = normalize_for_form(data)
    return ConfigLoadResponse(
        path=str(CONFIG_PATH),
        raw=raw,
        data=form_data,
        meta={
            "upstreamKinds": SUPPORTED_UPSTREAM_KINDS,
        },
    ).model_dump()


def normalize_for_form(data: dict[str, Any]) -> dict[str, Any]:
    upstreams = []
    for name, value in (data.get("upstreams") or {}).items():
        item = dict(value or {})
        item["name"] = name
        item.setdefault("kind", infer_upstream_kind(item))
        upstreams.append(item)

    aliases = []
    for name, value in (data.get("aliases") or {}).items():
        item = dict(value or {})
        item["name"] = name
        aliases.append(item)

    return {
        "server": data.get("server") or {},
        "debug": data.get("debug") or {},
        "routing": data.get("routing") or {"default_upstream": "", "path_rules": {}},
        "upstreams": upstreams,
        "global_chat_overrides": data.get("global_chat_overrides") or {},
        "global_extra_body": data.get("global_extra_body") or {},
        "aliases": aliases,
        "models_cache_ttl_seconds": data.get("models_cache_ttl_seconds", 60),
    }


def infer_upstream_kind(item: dict[str, Any]) -> str:
    base_url = str(item.get("base_url", ""))
    if "11434" in base_url or "ollama" in base_url.lower():
        return "ollama"
    if "sglang" in base_url.lower():
        return "sglang"
    return "openai-compatible"


def merge_form_data(original: dict[str, Any], form: dict[str, Any]) -> dict[str, Any]:
    merged = dict(original)
    merged["server"] = ensure_dict(form.get("server"))
    merged["debug"] = ensure_dict(form.get("debug"))
    merged["routing"] = normalize_routing(form.get("routing"))
    merged["upstreams"] = normalize_upstreams(form.get("upstreams"))
    merged["global_chat_overrides"] = ensure_dict(form.get("global_chat_overrides"))
    merged["global_extra_body"] = ensure_dict(form.get("global_extra_body"))
    merged["aliases"] = normalize_aliases(form.get("aliases"))
    merged["models_cache_ttl_seconds"] = int(form.get("models_cache_ttl_seconds", 60) or 60)
    return merged


def ensure_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    return {}


def normalize_routing(value: Any) -> dict[str, Any]:
    routing = ensure_dict(value)
    path_rules = routing.get("path_rules") or {}
    if isinstance(path_rules, list):
        converted = {}
        for item in path_rules:
            if not isinstance(item, dict):
                continue
            path = str(item.get("path", "")).strip()
            upstream = str(item.get("upstream", "")).strip()
            if path and upstream:
                converted[path] = upstream
        path_rules = converted
    return {
        "default_upstream": str(routing.get("default_upstream", "")).strip(),
        "path_rules": ensure_dict(path_rules),
    }


def normalize_upstreams(value: Any) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for item in value or []:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        payload = {k: v for k, v in item.items() if k not in {"name", "kind"}}
        payload.setdefault("api_key", "")
        payload.setdefault("timeout", 120)
        payload.setdefault("enabled", True)
        payload.setdefault("models_path", "/v1/models")
        payload.setdefault("headers", {})
        payload["headers"] = ensure_dict(payload.get("headers"))
        result[name] = payload
    return result


def normalize_aliases(value: Any) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for item in value or []:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        payload = {k: v for k, v in item.items() if k != "name"}
        payload.setdefault("overrides", {})
        payload.setdefault("extra_body", {})
        payload["overrides"] = ensure_dict(payload.get("overrides"))
        payload["extra_body"] = ensure_dict(payload.get("extra_body"))
        result[name] = payload
    return result


def validate_config_dict(data: dict[str, Any]) -> None:
    load_config.cache_clear()
    from app.config import AppConfig

    AppConfig.model_validate(data)


def save_config_dict(data: dict[str, Any]) -> None:
    validate_config_dict(data)
    raw = yaml.safe_dump(data, sort_keys=False, allow_unicode=True)
    save_config_raw(raw)


def save_config_raw(raw: str) -> None:
    tmp_path = CONFIG_PATH.with_suffix(CONFIG_PATH.suffix + ".tmp")
    tmp_path.write_text(raw, encoding="utf-8")
    os.replace(tmp_path, CONFIG_PATH)
    refresh_runtime_config()


def refresh_runtime_config() -> None:
    load_config.cache_clear()
    config = load_config()
    chat_model_registry.refresh(config)
    models_model_registry.refresh(config)
