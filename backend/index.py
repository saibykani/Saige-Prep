"""Entrypoint for serverless hosts (e.g. Vercel) that look for an `app` in index.py."""

from app.main import app

__all__ = ["app"]
