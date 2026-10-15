"""FastAPI dependencies: settings, database, current user, CSRF, admin guard."""

import hmac
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request, status
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings, get_settings
from app.security.sessions import CSRF_COOKIE, CSRF_HEADER, SESSION_COOKIE, get_session_user_id

SettingsDep = Annotated[Settings, Depends(get_settings)]

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def get_db(request: Request) -> AsyncDatabase:
    return request.app.state.database.db


DbDep = Annotated[AsyncDatabase, Depends(get_db)]


async def get_current_user(request: Request, db: DbDep, settings: SettingsDep) -> dict[str, Any]:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    user_id = await get_session_user_id(db, settings, token)
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired or invalid")
    user = await db.users.find_one({"_id": user_id, "is_active": True})
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Account unavailable")
    return user


def verify_csrf(request: Request) -> None:
    """Double-submit check: the header must echo the non-HttpOnly CSRF cookie.

    Cross-site pages cannot read our cookie, so they cannot forge the header.
    """
    if request.method in SAFE_METHODS:
        return
    cookie = request.cookies.get(CSRF_COOKIE)
    header = request.headers.get(CSRF_HEADER)
    if not cookie or not header or not hmac.compare_digest(cookie, header):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "CSRF token missing or invalid")


CurrentUser = Annotated[dict[str, Any], Depends(get_current_user)]


async def require_admin(user: CurrentUser) -> dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Administrator access required")
    return user


AdminUser = Annotated[dict[str, Any], Depends(require_admin)]
