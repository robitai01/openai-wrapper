from __future__ import annotations

from typing import Any

import httpx

from app.config import UpstreamConfig


HOP_BY_HOP_HEADERS = {
    "host",
    "content-length",
    "connection",
    "transfer-encoding",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "upgrade",
}


class UpstreamService:
    @staticmethod
    def build_headers(incoming_headers: dict[str, str], upstream: UpstreamConfig) -> dict[str, str]:
        headers = {
            key: value
            for key, value in incoming_headers.items()
            if key.lower() not in HOP_BY_HOP_HEADERS
        }
        headers.update(upstream.headers)
        if upstream.api_key:
            headers["Authorization"] = f"Bearer {upstream.api_key}"
        return headers

    @staticmethod
    async def request_json(
        method: str,
        url: str,
        headers: dict[str, str],
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        timeout: float = 120.0,
    ) -> httpx.Response:
        async with httpx.AsyncClient(timeout=timeout) as client:
            return await client.request(method=method, url=url, headers=headers, params=params, json=json_body)

    @staticmethod
    async def request_bytes(
        method: str,
        url: str,
        headers: dict[str, str],
        params: dict[str, Any] | None = None,
        body: bytes | None = None,
        timeout: float = 120.0,
    ) -> httpx.Response:
        async with httpx.AsyncClient(timeout=timeout) as client:
            return await client.request(method=method, url=url, headers=headers, params=params, content=body)

    @staticmethod
    async def stream(
        method: str,
        url: str,
        headers: dict[str, str],
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        timeout: float = 120.0,
    ):
        client = httpx.AsyncClient(timeout=timeout)
        request = client.build_request(method=method, url=url, headers=headers, params=params, json=json_body)
        response = await client.send(request, stream=True)
        return client, response
