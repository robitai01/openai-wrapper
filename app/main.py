from __future__ import annotations

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import load_config
from app.routers.chat import router as chat_router
from app.routers.models import router as models_router
from app.routers.proxy import router as proxy_router
from app.routers.ui import BASE_DIR, router as ui_router

app = FastAPI(title="OpenAI Wrapper", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.include_router(ui_router)
app.include_router(chat_router)
app.include_router(models_router)
app.include_router(proxy_router)


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})


if __name__ == "__main__":
    config = load_config()
    uvicorn.run(
        "app.main:app",
        host=config.server.host,
        port=config.server.port,
        reload=False,
    )
