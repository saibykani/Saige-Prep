import httpx
import pytest

from app.main import create_app
from tests.conftest import _test_settings

pytestmark = pytest.mark.integration


async def test_health_ok(client):
    response = await client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["app"] == "Saige-Prep"


async def test_ready_reports_database_ok(client):
    response = await client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "checks": [{"name": "mongodb", "ok": True}, {"name": "indexes", "ok": True}],
        "ai_enabled": False,
    }


async def test_ready_reports_index_failure_instead_of_crashing(settings, mongo_available, monkeypatch):
    if not mongo_available:
        pytest.skip("MongoDB not reachable")
    from pymongo.errors import OperationFailure

    async def failing_indexes(_db):
        raise OperationFailure("available disk space is less than required minimum", code=14031)

    monkeypatch.setattr("app.main.ensure_indexes", failing_indexes)
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.get("/ready")
    assert response.status_code == 503
    assert {"name": "indexes", "ok": False} in response.json()["checks"]
    assert "disk" not in response.text


async def test_ready_returns_503_without_leaking_uri_when_database_down():
    settings = _test_settings(mongodb_uri="mongodb://secret-user:secret-pass@127.0.0.1:1", mongodb_timeout_ms=300)
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            assert (await client.get("/health")).status_code == 200
            response = await client.get("/ready")
    assert response.status_code == 503
    assert response.json()["status"] == "not_ready"
    assert "secret" not in response.text
    assert "127.0.0.1" not in response.text


async def test_indexes_created(app):
    indexes = await app.state.database.db.sessions.index_information()
    assert "ttl_expires_at" in indexes
    assert "uniq_email" in await app.state.database.db.users.index_information()
