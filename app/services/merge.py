from __future__ import annotations

from copy import deepcopy
from typing import Any


def deep_merge_config_into_user(config_value: Any, user_value: Any) -> Any:
    if isinstance(config_value, dict) and isinstance(user_value, dict):
        merged = deepcopy(config_value)
        for key, value in user_value.items():
            if key in merged:
                merged[key] = deep_merge_config_into_user(merged[key], value)
            else:
                merged[key] = deepcopy(value)
        return merged
    return deepcopy(user_value)
