from fastapi import APIRouter, Request, Response, status

from app import __version__
from app.dependencies import SettingsDep
from app.schemas.health import HealthOut, ReadinessCheck, ReadinessOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut, summary="Liveness probe")
async def health(settings: SettingsDep) -> HealthOut:
    """Reports that the process is up. Does not touch dependencies."""
    return HealthOut(status="ok", app=settings.app_name, version=__version__)


@router.get(
    "/ready",
    response_model=ReadinessOut,
    summary="Readiness probe",
    responses={503: {"model": ReadinessOut, "description": "A required dependency is unavailable"}},
)
async def ready(request: Request, response: Response, settings: SettingsDep) -> ReadinessOut:
    """Verifies required dependencies. Never includes connection strings or error details."""
    checks = [
        ReadinessCheck(name="mongodb", ok=await request.app.state.database.ping()),
        ReadinessCheck(name="indexes", ok=request.app.state.indexes_ok),
    ]
    is_ready = all(check.ok for check in checks)
    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ReadinessOut(status="ready" if is_ready else "not_ready", checks=checks, ai_enabled=settings.ai_enabled)
