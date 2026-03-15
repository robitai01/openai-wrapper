from __future__ import annotations

import errno
import os
from pathlib import Path
from typing import Any, Literal

import yaml
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from app.config import DEFAULT_CONFIG_PATH, AppConfig, UpstreamConfig, load_config
from app.routers.chat import model_registry as chat_model_registry
from app.routers.models import model_registry as models_model_registry
from app.services.model_registry import ModelRegistry
from app.services.upstream_models import UpstreamModelsService

router = APIRouter()
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
CONFIG_PATH = DEFAULT_CONFIG_PATH


class ConfigSaveRequest(BaseModel):
    mode: Literal["form", "raw"]
    data: dict[str, Any] | None = None
    raw: str | None = None


class ConfigLoadResponse(BaseModel):
    path: str
    raw: str
    data: dict[str, Any]
    meta: dict[str, Any] = Field(default_factory=dict)


class UpstreamProbeRequest(BaseModel):
    upstream: dict[str, Any]


class ModelsPreviewRequest(BaseModel):
    data: dict[str, Any] | None = None


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


@router.post("/api/ui/upstream/test")
async def test_upstream(request_body: UpstreamProbeRequest):
    try:
        upstream = UpstreamConfig.model_validate(request_body.upstream)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid upstream config: {exc}") from exc
    result = await UpstreamModelsService.probe(upstream)
    return JSONResponse(result.model_dump())


@router.post("/api/ui/models/preview")
async def preview_models(request_body: ModelsPreviewRequest):
    try:
        if request_body.data is None:
            config = load_config()
        else:
            config_dict = merge_form_data({}, request_body.data)
            validate_config_dict(config_dict)
            config = AppConfig.model_validate(config_dict)
        snapshot = await ModelRegistry.build_snapshot_from_config(config)
        items: list[dict[str, Any]] = []
        for item in snapshot.models_payload.get("data", []):
            if not isinstance(item, dict):
                continue
            model_id = item.get("id")
            if not isinstance(model_id, str) or not model_id:
                continue
            alias = config.aliases.get(model_id)
            if alias:
                items.append(
                    {
                        "id": model_id,
                        "source": "alias",
                        "upstream": alias.upstream,
                        "target_model": alias.target_model,
                    }
                )
            else:
                items.append(
                    {
                        "id": model_id,
                        "source": "upstream",
                        "upstream": snapshot.model_to_upstream.get(model_id),
                        "target_model": None,
                    }
                )
        return JSONResponse(
            {
                "ok": True,
                "models_payload": snapshot.models_payload,
                "items": items,
                "warnings": [],
            }
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


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
        meta={},
    ).model_dump()


def normalize_for_form(data: dict[str, Any]) -> dict[str, Any]:
    upstreams = []
    for name, value in (data.get("upstreams") or {}).items():
        item = dict(value or {})
        item["name"] = name
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
    AppConfig.model_validate(data)



def save_config_dict(data: dict[str, Any]) -> None:
    validate_config_dict(data)
    raw = yaml.safe_dump(data, sort_keys=False, allow_unicode=True)
    save_config_raw(raw)



def save_config_raw(raw: str) -> None:
    tmp_path = CONFIG_PATH.with_suffix(CONFIG_PATH.suffix + ".tmp")
    tmp_path.write_text(raw, encoding="utf-8")
    try:
        os.replace(tmp_path, CONFIG_PATH)
    except OSError as exc:
        if exc.errno not in {errno.EBUSY, errno.EXDEV, errno.EPERM, errno.EACCES}:
            raise
        CONFIG_PATH.write_text(raw, encoding="utf-8")
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass
    refresh_runtime_config()



def refresh_runtime_config() -> None:
    load_config.cache_clear()
    config = load_config()
    chat_model_registry.refresh(config)
    models_model_registry.refresh(config)
