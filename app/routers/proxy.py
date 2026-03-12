from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from app.config import load_config
from app.services.upstream import UpstreamService
from app.utils.http import filter_response_headers, request_headers_dict

router = APIRouter()


@router.api_route("/v1/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_v1(path: str, request: Request):
    config = load_config()
    request_path = f"/v1/{path}"
    upstream_name = config.routing.path_rules.get(request_path, config.routing.default_upstream)
    upstream = config.upstreams[upstream_name]
    url = upstream.base_url.rstrip("/") + request.url.path
    if request.url.query:
        params = dict(request.query_params)
    else:
        params = None
    headers = UpstreamService.build_headers(request_headers_dict(request), upstream)
    body = await request.body()

    try:
        response = await UpstreamService.request_bytes(
            method=request.method,
            url=url,
            headers=headers,
            params=params,
            body=body,
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
