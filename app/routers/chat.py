from __future__ import annotations

import json
import logging
from copy import deepcopy
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse

from app.config import load_config
from app.services.model_registry import ModelRegistry
from app.services.override_engine import OverrideEngine
from app.services.upstream import UpstreamService
from app.utils.http import filter_response_headers, request_headers_dict

router = APIRouter()
logger = logging.getLogger(__name__)
model_registry = ModelRegistry(load_config())


def _truncate_text(value: str, limit: int) -> str:
    if limit <= 0 or len(value) <= limit:
        return value
    return value[:limit] + "...(truncated)"


def _sanitize_payload(payload: dict[str, Any], truncate_prompt_chars: int) -> dict[str, Any]:
    safe_payload = deepcopy(payload)
    messages = safe_payload.get("messages")
    if isinstance(messages, list):
        for message in messages:
            if not isinstance(message, dict):
                continue
            content = message.get("content")
            if isinstance(content, str):
                message["content"] = _truncate_text(content, truncate_prompt_chars)
            elif isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and isinstance(part.get("text"), str):
                        part["text"] = _truncate_text(part["text"], truncate_prompt_chars)
    input_value = safe_payload.get("input")
    if isinstance(input_value, str):
        safe_payload["input"] = _truncate_text(input_value, truncate_prompt_chars)
    return safe_payload


def _sanitize_headers(headers: dict[str, str]) -> dict[str, str]:
    safe_headers = dict(headers)
    for key in list(safe_headers.keys()):
        if key.lower() == "authorization":
            safe_headers[key] = "Bearer ***REDACTED***"
    return safe_headers


@router.post("/v1/chat/completions")
async def chat_completions(request: Request):
    config = load_config()
    payload = await request.json()
    requested_model = payload.get("model")
    alias = config.aliases.get(requested_model)

    if alias:
        upstream_name = alias.upstream
        payload["model"] = alias.target_model
        payload = OverrideEngine.apply_overrides(payload, alias.overrides)
        payload = OverrideEngine.merge_extra_body(payload, alias.extra_body)
    else:
        upstream_name = await model_registry.find_upstream_for_model(str(requested_model))
        if upstream_name is None:
            upstream_name = config.routing.default_upstream

    payload = OverrideEngine.apply_overrides(payload, config.global_chat_overrides)
    payload = OverrideEngine.merge_extra_body(payload, config.global_extra_body)

    upstream = config.upstreams[upstream_name]
    headers = UpstreamService.build_headers(request_headers_dict(request), upstream)
    url = upstream.base_url.rstrip("/") + "/v1/chat/completions"

    if config.debug.log_final_payload:
        logger.warning(
            "Final upstream payload for %s -> %s: %s",
            requested_model,
            upstream_name,
            json.dumps(_sanitize_payload(payload, config.debug.truncate_prompt_chars), ensure_ascii=False),
        )
    if config.debug.log_headers:
        logger.warning(
            "Upstream headers for %s -> %s: %s",
            requested_model,
            upstream_name,
            json.dumps(_sanitize_headers(headers), ensure_ascii=False),
        )

    try:
        if payload.get("stream") is True:
            client, response = await UpstreamService.stream(
                method="POST",
                url=url,
                headers=headers,
                json_body=payload,
                timeout=upstream.timeout,
            )
            response.raise_for_status()

            async def iterator():
                try:
                    async for chunk in response.aiter_bytes():
                        yield chunk
                finally:
                    await response.aclose()
                    await client.aclose()

            return StreamingResponse(
                iterator(),
                status_code=response.status_code,
                headers=filter_response_headers(dict(response.headers)),
                media_type=response.headers.get("content-type", "text/event-stream"),
            )

        response = await UpstreamService.request_json(
            method="POST",
            url=url,
            headers=headers,
            json_body=payload,
            timeout=upstream.timeout,
        )
        return JSONResponse(
            content=response.json(),
            status_code=response.status_code,
            headers=filter_response_headers(dict(response.headers)),
        )
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail=f"Upstream timeout: {exc}") from exc
    except httpx.HTTPStatusError as exc:
        content: Any
        try:
            content = exc.response.json()
        except Exception:
            content = {"error": {"message": exc.response.text, "type": "upstream_error", "code": exc.response.status_code}}
        return JSONResponse(content=content, status_code=exc.response.status_code)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Upstream request failed: {exc}") from exc
