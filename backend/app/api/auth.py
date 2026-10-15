"""Authentication endpoints. There is deliberately no public registration endpoint:
the owner account is created with `python -m scripts.create_owner`."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.dependencies import CurrentUser, DbDep, SettingsDep, verify_csrf
from app.schemas.auth import LoginRequest, SessionOut, UserOut, user_out
from app.security.passwords import hash_password, needs_rehash, verify_password
from app.security.sessions import (
    CSRF_COOKIE,
    SESSION_COOKIE,
    create_session,
    delete_session,
    new_csrf_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_auth_cookies(response: Response, settings, token: str, expires_at: datetime) -> None:
    max_age = int((expires_at - datetime.now(UTC)).total_seconds())
    common = {"max_age": max_age, "secure": settings.cookie_secure, "samesite": "lax", "path": "/"}
    response.set_cookie(SESSION_COOKIE, token, httponly=True, **common)
    # Readable by the frontend so it can echo it in the X-CSRF-Token header.
    response.set_cookie(CSRF_COOKIE, new_csrf_token(), httponly=False, **common)


def _clear_auth_cookies(response: Response, settings) -> None:
    for name in (SESSION_COOKIE, CSRF_COOKIE):
        response.delete_cookie(name, path="/", secure=settings.cookie_secure, samesite="lax")


@router.post(
    "/login",
    response_model=SessionOut,
    responses={401: {"description": "Invalid credentials"}, 429: {"description": "Too many attempts"}},
)
async def login(body: LoginRequest, request: Request, response: Response, db: DbDep, settings: SettingsDep):
    email = body.email.lower()
    # Keyed on the account, so attempts are counted however many addresses an attacker uses.
    limiter = request.app.state.login_limiter
    allowed, retry_after = limiter.hit(f"login:{email}")
    if not allowed:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many login attempts. Try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    user = await db.users.find_one({"email": email, "is_active": True})
    if not verify_password(user["password_hash"] if user else None, body.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    limiter.reset(f"login:{email}")
    updates: dict = {"last_login_at": datetime.now(UTC)}
    if needs_rehash(user["password_hash"]):
        updates["password_hash"] = hash_password(body.password)
    await db.users.update_one({"_id": user["_id"]}, {"$set": updates})

    token, expires_at = await create_session(db, settings, user["_id"], request.headers.get("user-agent"))
    _set_auth_cookies(response, settings, token, expires_at)
    return SessionOut(user=user_out(user), expires_at=expires_at)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(verify_csrf)])
async def logout(request: Request, response: Response, db: DbDep, settings: SettingsDep) -> Response:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        await delete_session(db, settings, token)
    response.status_code = status.HTTP_204_NO_CONTENT
    _clear_auth_cookies(response, settings)
    return response


@router.get("/me", response_model=UserOut, responses={401: {"description": "Not authenticated"}})
async def me(user: CurrentUser) -> UserOut:
    return user_out(user)
