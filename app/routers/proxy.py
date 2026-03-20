from __future__ import annotations

import json
import logging
from copy import deepcopy
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from app.config import load_config
from app.services.model_registry import ModelRegistry
from app.services.upstream import UpstreamService
from app.utils.http import filter_response_headers, request_headers_dict

router = APIRouter()
logger = logging.getLogger(__name__)
model_registry = ModelRegistry(load_config())


async def _resolve_upstream_for_body(body: bytes, config) -> tuple[str, bytes]:
    """从 request body 中提取 model，走 alias → ModelRegistry → default_upstream 路由。

    Returns:
        (upstream_name, possibly_modified_body)
    """
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return config.routing.default_upstream, body

    if not isinstance(payload, dict):
        return config.routing.default_upstream, body

    model = payload.get("model")
    if not model:
        return config.routing.default_upstream, body

    model_str = str(model)

    # alias 匹配
    alias = config.aliases.get(model_str)
    if alias:
        modified = deepcopy(payload)
        modified["model"] = alias.target_model
        return alias.upstream, json.dumps(modified, ensure_ascii=False).encode()

    # ModelRegistry 查找
    upstream_name = await model_registry.find_upstream_for_model(model_str)
    if upstream_name:
        return upstream_name, body

    return config.routing.default_upstream, body


@router.api_route("/v1/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_v1(path: str, request: Request):
    config = load_config()
    request_path = f"/v1/{path}"
    body = await request.body()

    upstream_name, forward_body = await _resolve_upstream_for_body(body, config)
    upstream = config.upstreams[upstream_name]
    url = upstream.base_url.rstrip("/") + request.url.path
    if request.url.query:
        params = dict(request.query_params)
    else:
        params = None
    headers = UpstreamService.build_headers(request_headers_dict(request), upstream)

    try:
        response = await UpstreamService.request_bytes(
            method=request.method,
            url=url,
            headers=headers,
            params=params,
            body=forward_body,
            timeout=upstream.timeout,
        )
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=filter_response_headers(dict(response.headers)),
            media_type=response.headers.get("content-type"),
        )
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail=f"Upstream timeout: {exc}") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Upstream request failed: {exc}") from exc
