from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.routers.chat import router as chat_router
from app.routers.models import router as models_router
from app.routers.proxy import router as proxy_router
from app.routers.ui import BASE_DIR, router as ui_router

app = FastAPI(title="OpenAI Wrapper", version="0.1.0")
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.include_router(ui_router)
app.include_router(chat_router)
app.include_router(models_router)
app.include_router(proxy_router)


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})
