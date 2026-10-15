"""MongoDB connection management using the PyMongo asynchronous API."""

import logging

from pymongo import ASCENDING, AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.config import Settings

logger = logging.getLogger(__name__)


class Database:
    """Owns the single AsyncMongoClient for the process."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self.client: AsyncMongoClient = AsyncMongoClient(
            settings.mongodb_uri.get_secret_value(),
            serverSelectionTimeoutMS=settings.mongodb_timeout_ms,
            connectTimeoutMS=settings.mongodb_timeout_ms,
            tz_aware=True,
            appname=settings.app_name,
        )
        self.db: AsyncDatabase = self.client[settings.mongodb_database]

    async def ping(self) -> bool:
        try:
            await self.client.admin.command("ping")
            return True
        except Exception as exc:  # noqa: BLE001 - readiness must never raise
            # Log the exception type only; the message can contain host details.
            logger.warning("MongoDB ping failed: %s", type(exc).__name__)
            return False

    async def close(self) -> None:
        await self.client.close()


async def ensure_indexes(db: AsyncDatabase) -> None:
    """Create indexes required by the application. Safe to run repeatedly."""
    await db.users.create_index([("email", ASCENDING)], unique=True, name="uniq_email")
    await db.sessions.create_index([("token_hash", ASCENDING)], unique=True, name="uniq_token_hash")
    await db.sessions.create_index([("user_id", ASCENDING)], name="by_user")
    # TTL index: MongoDB deletes sessions automatically once expires_at passes.
    await db.sessions.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0, name="ttl_expires_at")
