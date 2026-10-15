"""Application configuration loaded from environment variables (and an optional .env file)."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PLACEHOLDER_SECRET = "replace-with-a-long-random-secret"  # noqa: S105 - sentinel; rejected in production


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    app_name: str = "Saige-Prep"

    mongodb_uri: SecretStr = SecretStr("mongodb://127.0.0.1:27017")
    mongodb_database: str = "saige_prep"
    mongodb_timeout_ms: int = Field(default=3000, ge=100, le=60000)

    frontend_origin: str = "http://localhost:3000"
    session_secret: SecretStr = SecretStr(PLACEHOLDER_SECRET)
    session_ttl_hours: int = Field(default=24 * 7, ge=1, le=24 * 90)

    # Login attempts allowed per client within the window before HTTP 429.
    login_rate_limit: int = Field(default=5, ge=1)
    login_rate_window_seconds: int = Field(default=300, ge=1)

    ai_provider: Literal["none", "anthropic", "openai"] = "none"
    ai_api_key: SecretStr = SecretStr("")
    ai_model: str = ""

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def cookie_secure(self) -> bool:
        # Secure cookies require HTTPS; local development runs over plain HTTP.
        return self.is_production

    @property
    def ai_enabled(self) -> bool:
        return self.ai_provider != "none" and bool(self.ai_api_key.get_secret_value())

    @model_validator(mode="after")
    def _reject_unsafe_production_config(self) -> "Settings":
        if self.is_production:
            secret = self.session_secret.get_secret_value()
            if secret == PLACEHOLDER_SECRET or len(secret) < 32:
                raise ValueError("SESSION_SECRET must be a random value of at least 32 characters in production")
            if self.frontend_origin.startswith("http://"):
                raise ValueError("FRONTEND_ORIGIN must use https in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
