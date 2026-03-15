from __future__ import annotations

from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.config import UpstreamConfig
from app.services.upstream import UpstreamService


class UpstreamModelsProbeResult(BaseModel):
    ok: bool
    status_code: int | None = None
    error: str | None = None
    base_url: str
    models_path: str
    model_ids: list[str] = Field(default_factory=list)
    raw_models_payload: dict[str, Any] | None = None


class UpstreamModelsService:
    @staticmethod
    async def probe(upstream: UpstreamConfig) -> UpstreamModelsProbeResult:
        url = upstream.base_url.rstrip("/") + upstream.models_path
        headers = UpstreamService.build_headers({}, upstream)
        try:
            response = await UpstreamService.request_json(
                method="GET",
                url=url,
                headers=headers,
                timeout=upstream.timeout,
            )
            response.raise_for_status()
            try:
                payload = response.json()
            except Exception as exc:
                return UpstreamModelsProbeResult(
                    ok=False,
                    status_code=response.status_code,
                    error=f"Invalid JSON response from upstream models endpoint: {exc}",
                    base_url=upstream.base_url,
                    models_path=upstream.models_path,
                    model_ids=[],
                    raw_models_payload=None,
                )
            data = payload.get("data", []) if isinstance(payload, dict) else []
            model_ids: list[str] = []
            for item in data:
                if isinstance(item, dict):
                    model_id = item.get("id")
                    if isinstance(model_id, str) and model_id:
                        model_ids.append(model_id)
            return UpstreamModelsProbeResult(
                ok=True,
                status_code=response.status_code,
                error=None,
                base_url=upstream.base_url,
                models_path=upstream.models_path,
                model_ids=model_ids,
                raw_models_payload=payload if isinstance(payload, dict) else None,
            )
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text
            try:
                parsed = exc.response.json()
                if isinstance(parsed, dict):
                    detail = parsed.get("detail") or parsed.get("message") or parsed.get("error", {}).get("message") or detail
            except Exception:
                pass
            return UpstreamModelsProbeResult(
                ok=False,
                status_code=exc.response.status_code,
                error=str(detail),
                base_url=upstream.base_url,
                models_path=upstream.models_path,
                model_ids=[],
                raw_models_payload=None,
            )
        except httpx.TimeoutException as exc:
            return UpstreamModelsProbeResult(
                ok=False,
                status_code=None,
                error=f"Timeout: {exc}",
                base_url=upstream.base_url,
                models_path=upstream.models_path,
                model_ids=[],
                raw_models_payload=None,
            )
        except httpx.RequestError as exc:
            return UpstreamModelsProbeResult(
                ok=False,
                status_code=None,
                error=f"Request failed: {exc}",
                base_url=upstream.base_url,
                models_path=upstream.models_path,
                model_ids=[],
                raw_models_payload=None,
            )
