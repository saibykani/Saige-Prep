from datetime import UTC, datetime, timedelta

import pytest

from app.security.sessions import CSRF_COOKIE, SESSION_COOKIE
from tests.conftest import OWNER_PASSWORD, login

pytestmark = pytest.mark.integration


@pytest.mark.parametrize("path", ["/api/auth/register", "/api/auth/signup", "/api/users"])
async def test_no_public_registration_endpoint(client, path):
    response = await client.post(path, json={"email": "x@example.com", "password": "Whatever-123456"})
    assert response.status_code in (404, 405)


async def test_logout_rejects_missing_or_mismatched_csrf(client, owner):
    await login(client)
    assert (await client.post("/api/auth/logout")).status_code == 403
    assert (await client.post("/api/auth/logout", headers={"X-CSRF-Token": "forged"})).status_code == 403
    # Session must still be valid after the rejected attempts.
    assert (await client.get("/api/auth/me")).status_code == 200


async def test_login_rate_limited_per_account(client, owner):
    for _ in range(5):
        assert (await login(client, password="Wrong-Password-1")).status_code == 401
    blocked = await login(client)  # even the correct password is blocked now
    assert blocked.status_code == 429
    assert int(blocked.headers["Retry-After"]) >= 1


async def test_validation_errors_do_not_echo_submitted_password(client):
    secret = "Super-Secret-Value-99"
    response = await client.post("/api/auth/login", json={"email": "not-an-email", "password": secret})
    assert response.status_code == 422
    assert secret not in response.text


async def test_unknown_fields_rejected(client):
    response = await client.post("/api/auth/login", json={"email": "a@example.com", "password": "x", "role": "admin"})
    assert response.status_code == 422


async def test_session_token_not_stored_in_plaintext(client, owner, app):
    await login(client)
    token = client.cookies.get(SESSION_COOKIE)
    stored = await app.state.database.db.sessions.find_one({})
    assert token not in str(stored)


async def test_expired_session_rejected(client, owner, app):
    await login(client)
    await app.state.database.db.sessions.update_many(
        {}, {"$set": {"expires_at": datetime.now(UTC) - timedelta(seconds=1)}}
    )
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_forged_session_cookie_rejected(client, owner):
    client.cookies.set(SESSION_COOKIE, "forged-token")
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_security_headers_present(client):
    response = await client.get("/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["X-Request-ID"]


async def test_cors_only_allows_configured_origin(client):
    allowed = await client.options(
        "/api/auth/me",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    denied = await client.options(
        "/api/auth/me",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
    )
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "access-control-allow-origin" not in denied.headers


async def test_csrf_cookie_rotates_on_each_login(client, owner):
    await login(client)
    first = client.cookies.get(CSRF_COOKIE)
    client.cookies.clear()
    await login(client, password=OWNER_PASSWORD)
    assert client.cookies.get(CSRF_COOKIE) != first
