import pytest
from pydantic import ValidationError

from app.config import PLACEHOLDER_SECRET, Settings


def test_development_defaults_disable_ai_and_secure_cookies():
    settings = Settings(_env_file=None)
    assert settings.ai_enabled is False
    assert settings.cookie_secure is False


def test_ai_requires_provider_and_key():
    assert Settings(_env_file=None, ai_provider="anthropic").ai_enabled is False
    assert Settings(_env_file=None, ai_provider="anthropic", ai_api_key="k").ai_enabled is True


def test_production_rejects_placeholder_secret():
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            app_env="production",
            session_secret=PLACEHOLDER_SECRET,
            frontend_origin="https://prep.example.com",
        )


def test_production_rejects_plain_http_origin():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, app_env="production", session_secret="s" * 48, frontend_origin="http://x.example")


def test_production_accepts_strong_config():
    settings = Settings(
        _env_file=None, app_env="production", session_secret="s" * 48, frontend_origin="https://prep.example.com"
    )
    assert settings.cookie_secure is True


def test_secrets_are_masked_in_repr():
    settings = Settings(_env_file=None, mongodb_uri="mongodb://user:hunter2@host/db")
    assert "hunter2" not in repr(settings)
