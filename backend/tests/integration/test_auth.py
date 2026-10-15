import pytest

from app.security.sessions import CSRF_COOKIE, SESSION_COOKIE
from tests.conftest import OWNER_EMAIL, login

pytestmark = pytest.mark.integration


async def test_login_sets_httponly_session_and_readable_csrf_cookie(client, owner):
    response = await login(client)
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == OWNER_EMAIL
    assert body["user"]["role"] == "admin"
    assert "password_hash" not in response.text

    set_cookies = response.headers.get_list("set-cookie")
    session = next(c for c in set_cookies if c.startswith(f"{SESSION_COOKIE}="))
    csrf = next(c for c in set_cookies if c.startswith(f"{CSRF_COOKIE}="))
    assert "HttpOnly" in session and "samesite=lax" in session.lower()
    assert "HttpOnly" not in csrf


async def test_email_is_case_insensitive(client, owner):
    response = await login(client, email=OWNER_EMAIL.upper())
    assert response.status_code == 200


async def test_me_requires_session_and_returns_user(client, owner):
    assert (await client.get("/api/auth/me")).status_code == 401
    await login(client)
    response = await client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == OWNER_EMAIL


async def test_wrong_password_and_unknown_user_get_identical_errors(client, owner):
    wrong = await login(client, password="Wrong-Password-1")
    unknown = await login(client, email="nobody@example.com")
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


async def test_logout_revokes_session(client, owner, app):
    await login(client)
    csrf = client.cookies.get(CSRF_COOKIE)
    response = await client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf})
    assert response.status_code == 204
    assert await app.state.database.db.sessions.count_documents({}) == 0
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_deactivated_user_loses_access(client, owner, app):
    await login(client)
    await app.state.database.db.users.update_one({"_id": owner["_id"]}, {"$set": {"is_active": False}})
    assert (await client.get("/api/auth/me")).status_code == 401
