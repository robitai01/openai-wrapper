from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.config import load_config
from app.services.model_registry import ModelRegistry

router = APIRouter()
model_registry = ModelRegistry(load_config())


@router.get("/v1/models")
async def list_models():
    snapshot = await model_registry.get_snapshot()
    return JSONResponse(content=snapshot.models_payload)
