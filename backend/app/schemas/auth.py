from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    role: Literal["admin", "learner"]
    created_at: datetime


class SessionOut(BaseModel):
    user: UserOut
    expires_at: datetime


def user_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        email=doc["email"],
        display_name=doc.get("display_name") or doc["email"].split("@")[0],
        role=doc.get("role", "learner"),
        created_at=doc["created_at"],
    )
