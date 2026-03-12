from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.config import OverrideRule
from app.services.merge import deep_merge_config_into_user


class OverrideEngine:
    @staticmethod
    def apply_overrides(payload: dict[str, Any], overrides: dict[str, OverrideRule]) -> dict[str, Any]:
        result = deepcopy(payload)
        for field, rule in overrides.items():
            if rule.mode == "remove":
                result.pop(field, None)
            elif rule.mode == "force":
                result[field] = deepcopy(rule.value)
            elif rule.mode == "default":
                result.setdefault(field, deepcopy(rule.value))
            else:
                raise ValueError(f"Unsupported override mode: {rule.mode}")
        return result

    @staticmethod
    def merge_extra_body(payload: dict[str, Any], extra_body: dict[str, Any]) -> dict[str, Any]:
        return deep_merge_config_into_user(extra_body, payload)
