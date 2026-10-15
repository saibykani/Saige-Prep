"""Opaque server-side sessions.

The browser holds a random token in an HttpOnly cookie. MongoDB stores only an
HMAC of that token, so a database leak does not yield usable session cookies.
"""

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings

SESSION_COOKIE = "saige_session"
CSRF_COOKIE = "saige_csrf"
CSRF_HEADER = "X-CSRF-Token"


def _token_hash(token: str, settings: Settings) -> str:
    key = settings.session_secret.get_secret_value().encode()
    return hmac.new(key, token.encode(), hashlib.sha256).hexdigest()


def new_csrf_token() -> str:
    return secrets.token_urlsafe(32)


async def create_session(
    db: AsyncDatabase, settings: Settings, user_id: ObjectId, user_agent: str | None
) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    now = datetime.now(UTC)
    expires_at = now + timedelta(hours=settings.session_ttl_hours)
    await db.sessions.insert_one(
        {
            "token_hash": _token_hash(token, settings),
            "user_id": user_id,
            "created_at": now,
            "expires_at": expires_at,
            "user_agent": (user_agent or "")[:300],
        }
    )
    return token, expires_at


async def get_session_user_id(db: AsyncDatabase, settings: Settings, token: str) -> ObjectId | None:
    session = await db.sessions.find_one({"token_hash": _token_hash(token, settings)})
    if session is None:
        return None
    # The TTL monitor runs about once a minute, so check expiry explicitly too.
    if session["expires_at"] <= datetime.now(UTC):
        await db.sessions.delete_one({"_id": session["_id"]})
        return None
    return session["user_id"]


async def delete_session(db: AsyncDatabase, settings: Settings, token: str) -> None:
    await db.sessions.delete_one({"token_hash": _token_hash(token, settings)})


async def delete_user_sessions(db: AsyncDatabase, user_id: ObjectId) -> int:
    result = await db.sessions.delete_many({"user_id": user_id})
    return result.deleted_count
