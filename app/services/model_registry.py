from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

from app.config import AppConfig
from app.services.upstream_models import UpstreamModelsService


@dataclass
class ModelsSnapshot:
    expires_at: float
    models_payload: dict[str, Any]
    model_to_upstream: dict[str, str]


class ModelRegistry:
    def __init__(self, config: AppConfig):
        self.config = config
        self._snapshot: ModelsSnapshot | None = None

    def refresh(self, config: AppConfig) -> None:
        self.config = config
        self._snapshot = None

    @staticmethod
    async def build_snapshot_from_config(config: AppConfig) -> ModelsSnapshot:
        now = time.time()
        merged: list[dict[str, Any]] = []
        model_to_upstream: dict[str, str] = {}
        seen: set[str] = set()

        for upstream_name, upstream in config.upstreams.items():
            if not upstream.enabled:
                continue
            probe = await UpstreamModelsService.probe(upstream)
            payload = probe.raw_models_payload or {}
            for item in payload.get("data", []):
                if not isinstance(item, dict):
                    continue
                model_id = item.get("id")
                if not model_id or model_id in seen:
                    continue
                seen.add(model_id)
                merged.append(item)
                model_to_upstream[model_id] = upstream_name

        for alias_name in config.aliases:
            if alias_name in seen:
                continue
            merged.append({"id": alias_name, "object": "model", "owned_by": "wrapper", "permission": []})
            seen.add(alias_name)

        payload = {"object": "list", "data": merged}
        return ModelsSnapshot(
            expires_at=now + config.models_cache_ttl_seconds,
            models_payload=payload,
            model_to_upstream=model_to_upstream,
        )

    async def get_snapshot(self) -> ModelsSnapshot:
        now = time.time()
        if self._snapshot and self._snapshot.expires_at > now:
            return self._snapshot
        snapshot = await self.build_snapshot_from_config(self.config)
        self._snapshot = snapshot
        return snapshot

    async def find_upstream_for_model(self, model_name: str) -> str | None:
        snapshot = await self.get_snapshot()
        return snapshot.model_to_upstream.get(model_name)
