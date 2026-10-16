import os
from collections.abc import AsyncIterator
from datetime import UTC, datetime

import httpx
import pytest
from pymongo import MongoClient

from app.config import Settings
from app.main import create_app
from app.security.passwords import hash_password

OWNER_EMAIL = "owner@example.com"
OWNER_PASSWORD = "Correct-Horse-42"


def _test_settings(**overrides) -> Settings:
    base = {
        "app_env": "test",
        # Same server as development (from .env) unless TEST_MONGODB_URI overrides it.
        "mongodb_uri": os.environ.get("TEST_MONGODB_URI") or Settings().mongodb_uri.get_secret_value(),
        # Never the real database: tests drop this database freely.
        "mongodb_database": "saige_prep_test",
        "mongodb_timeout_ms": 2000,
        "session_secret": "test-secret-" + "x" * 40,
        "login_rate_limit": 5,
        "login_rate_window_seconds": 60,
    }
    base.update(overrides)
    return Settings(_env_file=None, **base)


@pytest.fixture
def settings() -> Settings:
    return _test_settings()


@pytest.fixture(scope="session")
def mongo_available() -> bool:
    try:
        MongoClient(_test_settings().mongodb_uri.get_secret_value(), serverSelectionTimeoutMS=1500).admin.command(
            "ping"
        )
        return True
    except Exception:  # noqa: BLE001
        return False


@pytest.fixture
async def app(settings: Settings, mongo_available: bool):
    if not mongo_available:
        pytest.skip("MongoDB not reachable; start it to run integration tests")
    application = create_app(settings)
    async with application.router.lifespan_context(application):
        db = application.state.database.db
        assert db.name.endswith("_test")
        for name in await db.list_collection_names():
            await db[name].delete_many({})
        yield application


@pytest.fixture
async def client(app) -> AsyncIterator[httpx.AsyncClient]:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c


@pytest.fixture
async def owner(app) -> dict:
    now = datetime.now(UTC)
    doc = {
        "email": OWNER_EMAIL,
        "display_name": "Owner",
        "password_hash": hash_password(OWNER_PASSWORD),
        "role": "admin",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }
    result = await app.state.database.db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def login(client: httpx.AsyncClient, email: str = OWNER_EMAIL, password: str = OWNER_PASSWORD):
    return await client.post("/api/auth/login", json={"email": email, "password": password})
