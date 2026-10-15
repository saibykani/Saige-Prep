"""Reset the end-to-end test database and create a deterministic test owner.

Only ever operates on a database whose name ends in `_e2e`.
Usage: MONGODB_DATABASE=saige_prep_e2e python -m scripts.e2e_reset
"""

import asyncio
import os
import sys
from datetime import UTC, datetime

from app.config import get_settings
from app.database import Database, ensure_indexes
from app.security.passwords import hash_password

E2E_EMAIL = os.environ.get("E2E_OWNER_EMAIL", "e2e-owner@example.com")
E2E_PASSWORD = os.environ.get("E2E_OWNER_PASSWORD", "E2e-Owner-Pass-2026")


async def main() -> int:
    settings = get_settings()
    if not settings.mongodb_database.endswith("_e2e"):
        print("Refusing to reset: MONGODB_DATABASE must end with _e2e", file=sys.stderr)
        return 1
    database = Database(settings)
    try:
        if not await database.ping():
            print("Cannot reach MongoDB.", file=sys.stderr)
            return 1
        await database.client.drop_database(settings.mongodb_database)
        await ensure_indexes(database.db)
        now = datetime.now(UTC)
        await database.db.users.insert_one(
            {
                "email": E2E_EMAIL,
                "display_name": "E2E Owner",
                "password_hash": hash_password(E2E_PASSWORD),
                "role": "admin",
                "is_active": True,
                "created_at": now,
                "updated_at": now,
            }
        )
        print(f"Reset {settings.mongodb_database} with owner {E2E_EMAIL}")
        return 0
    finally:
        await database.close()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
