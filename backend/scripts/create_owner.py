"""Explicit bootstrap for the single owner (administrator) account.

Usage (from backend/):
    .venv\\Scripts\\python.exe -m scripts.create_owner --email you@example.com --name "Your Name"
    .venv\\Scripts\\python.exe -m scripts.create_owner --email you@example.com --reset-password

The password is read interactively, or from SAIGE_OWNER_PASSWORD for automation.
There is no default password and no public sign-up endpoint.
"""

import argparse
import asyncio
import getpass
import os
import sys
from datetime import UTC, datetime

from app.config import get_settings
from app.database import Database, ensure_indexes
from app.security.passwords import hash_password, validate_password_strength
from app.security.sessions import delete_user_sessions


def _read_password() -> str:
    password = os.environ.get("SAIGE_OWNER_PASSWORD")
    if password:
        return password
    first = getpass.getpass("Owner password: ")
    if first != getpass.getpass("Confirm password: "):
        sys.exit("Passwords do not match.")
    return first


async def main() -> int:
    parser = argparse.ArgumentParser(description="Create or reset the Saige-Prep owner account.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="")
    parser.add_argument("--reset-password", action="store_true", help="Reset the password of an existing owner")
    args = parser.parse_args()
    email = args.email.strip().lower()

    database = Database(get_settings())
    try:
        if not await database.ping():
            print("Cannot reach MongoDB. Check MONGODB_URI.", file=sys.stderr)
            return 1
        db = database.db
        await ensure_indexes(db)
        existing = await db.users.find_one({"email": email})

        if args.reset_password:
            if existing is None:
                print(f"No account for {email}.", file=sys.stderr)
                return 1
        elif await db.users.count_documents({"role": "admin"}) > 0:
            print("An owner account already exists. Use --reset-password to change its password.", file=sys.stderr)
            return 1

        password = _read_password()
        problems = validate_password_strength(password)
        if problems:
            print("Password rejected: " + "; ".join(problems), file=sys.stderr)
            return 1

        now = datetime.now(UTC)
        if args.reset_password:
            await db.users.update_one(
                {"_id": existing["_id"]},
                {"$set": {"password_hash": hash_password(password), "updated_at": now}},
            )
            revoked = await delete_user_sessions(db, existing["_id"])
            print(f"Password reset for {email}; {revoked} session(s) revoked.")
        else:
            await db.users.insert_one(
                {
                    "email": email,
                    "display_name": args.name.strip() or email.split("@")[0],
                    "password_hash": hash_password(password),
                    "role": "admin",
                    "is_active": True,
                    "created_at": now,
                    "updated_at": now,
                }
            )
            print(f"Owner account created for {email}.")
        return 0
    finally:
        await database.close()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
