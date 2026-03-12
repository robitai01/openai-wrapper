from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from app.config import AppConfig
from app.services.upstream import UpstreamService


@dataclass
class ModelsSnapshot:
    expires_at: float
    models_payload: dict[str, Any]
    model_to_upstream: dict[str, str]


class ModelRegistry:
    def __init__(self, config: AppConfig):
        self.config = config
        self._snapshot: ModelsSnapshot | None = None

    async def get_snapshot(self) -> ModelsSnapshot:
        now = time.time()
        if self._snapshot and self._snapshot.expires_at > now:
            return self._snapshot

        merged: list[dict[str, Any]] = []
        model_to_upstream: dict[str, str] = {}
        seen: set[str] = set()

        for upstream_name, upstream in self.config.upstreams.items():
            if not upstream.enabled:
                continue
            url = upstream.base_url.rstrip("/") + upstream.models_path
            headers = UpstreamService.build_headers({}, upstream)
            try:
                response = await UpstreamService.request_json("GET", url, headers, timeout=upstream.timeout)
                response.raise_for_status()
                data = response.json()
                for item in data.get("data", []):
                    model_id = item.get("id")
                    if not model_id or model_id in seen:
                        continue
                    seen.add(model_id)
                    merged.append(item)
                    model_to_upstream[model_id] = upstream_name
            except Exception:
                continue

        for alias_name in self.config.aliases:
            if alias_name in seen:
                continue
            merged.append({"id": alias_name, "object": "model", "owned_by": "wrapper", "permission": []})
            seen.add(alias_name)

        payload = {"object": "list", "data": merged}
        snapshot = ModelsSnapshot(
            expires_at=now + self.config.models_cache_ttl_seconds,
            models_payload=payload,
            model_to_upstream=model_to_upstream,
        )
        self._snapshot = snapshot
        return snapshot

    async def find_upstream_for_model(self, model_name: str) -> str | None:
        snapshot = await self.get_snapshot()
        return snapshot.model_to_upstream.get(model_name)
