"""
FastAPI Main Application Entry Point for LazyLoop AI.
Configures lifespan events, CORS, loopback binding security, and router inclusion.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on startup
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Open-source AI that eliminates busywork, learns approved routines, and proves every result.",
    lifespan=lifespan,
)

# Strict CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "product": "LazyLoop AI",
        "tagline": "Do less busywork. Get proof, not promises.",
        "version": settings.version,
        "docs_url": "/docs",
    }
