from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Topix Market API"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/topix_market"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    mercado_pago_access_token: str = ""
    mercado_pago_back_url: str = "http://localhost:5173/checkout"
    mercado_pago_success_url: str = "http://localhost:5173/checkout?payment=success"
    mercado_pago_failure_url: str = "http://localhost:5173/checkout?payment=failure"
    mercado_pago_pending_url: str = "http://localhost:5173/checkout?payment=pending"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    flat_shipping_rate: int = 2500
    uploads_dir: str = "uploads"
    uploads_storage_dir: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if not isinstance(value, str):
            return value

        if value.startswith("postgresql+psycopg://"):
            return value

        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)

        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)

        return value

    @property
    def backend_dir(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def uploads_path(self) -> Path:
        if self.uploads_storage_dir:
            storage_dir = Path(self.uploads_storage_dir)
            if storage_dir.is_absolute():
                return storage_dir
            return self.backend_dir / storage_dir

        render_data_dir = Path("/var/data")
        if render_data_dir.exists():
            return render_data_dir / self.uploads_dir

        return self.backend_dir / self.uploads_dir


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
