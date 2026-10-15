from typing import Literal

from pydantic import BaseModel


class HealthOut(BaseModel):
    status: Literal["ok"]
    app: str
    version: str


class ReadinessCheck(BaseModel):
    name: str
    ok: bool


class ReadinessOut(BaseModel):
    status: Literal["ready", "not_ready"]
    checks: list[ReadinessCheck]
    ai_enabled: bool
