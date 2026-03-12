from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.routers.chat import router as chat_router
from app.routers.models import router as models_router
from app.routers.proxy import router as proxy_router

app = FastAPI(title="OpenAI Wrapper", version="0.1.0")
app.include_router(chat_router)
app.include_router(models_router)
app.include_router(proxy_router)


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})
