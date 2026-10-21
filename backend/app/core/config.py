"""
LazyLoop AI Configuration Settings.
Loads from environment variables with safe defaults.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_name: str = "LazyLoop AI"
    version: str = "1.0.0"
    host: str = "127.0.0.1"
    port: int = 8000
    database_url: str = "sqlite:///./data/lazyloop.db"
    database_path: str = "./data/lazyloop.db"
    
    # Security & CORS
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # AI & Ollama
    ollama_base_url: str = "http://127.0.0.1:11434"
    default_model: str = "llama3.2:latest"
    fallback_to_mock: bool = True
    
    # Sandbox limits
    max_workspace_depth: int = 10
    max_file_size_bytes: int = 10 * 1024 * 1024  # 10 MB limit for safety
    allow_symlinks: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
