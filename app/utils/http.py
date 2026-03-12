from __future__ import annotations

from fastapi import Request


def request_headers_dict(request: Request) -> dict[str, str]:
    return {key: value for key, value in request.headers.items()}


def filter_response_headers(headers: dict[str, str]) -> dict[str, str]:
    blocked = {"content-length", "transfer-encoding", "connection", "content-encoding"}
    return {key: value for key, value in headers.items() if key.lower() not in blocked}
