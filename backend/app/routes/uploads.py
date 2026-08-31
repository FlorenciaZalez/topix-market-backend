import logging
from pathlib import Path
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.config import settings
from app.deps import get_current_admin
from app.models.user import User


router = APIRouter(prefix="/uploads", tags=["uploads"])
logger = logging.getLogger(__name__)


def build_upload_public_url(filename: str) -> str:
    return (
        f"{settings.supabase_url.rstrip('/')}"
        f"/storage/v1/object/public/"
        f"{settings.supabase_storage_bucket}/{filename}"
    )


@router.post("/images", response_model=list[str])
async def upload_images(
    files: list[UploadFile] = File(...),
    current_admin: User = Depends(get_current_admin),
) -> list[str]:
    saved_files: list[str] = []

    async with httpx.AsyncClient(timeout=60.0) as client:
        for file in files:
            extension = Path(file.filename or "").suffix or ".jpg"
            filename = f"{uuid4().hex}{extension}"
            contents = await file.read()

            upload_url = (
                f"{settings.supabase_url.rstrip('/')}"
                f"/storage/v1/object/"
                f"{settings.supabase_storage_bucket}/{filename}"
            )

            response = await client.post(
                upload_url,
                content=contents,
                headers={
                    "apikey": settings.supabase_secret_key,
                    "Content-Type": file.content_type or "application/octet-stream",
                    "x-upsert": "false",
                },
            )

            if response.status_code not in (200, 201):
                logger.error(
                    "Supabase upload failed status=%s response=%s",
                    response.status_code,
                    response.text,
                )
                raise HTTPException(
                    status_code=500,
                    detail="No se pudo subir la imagen.",
                )

            saved_files.append(build_upload_public_url(filename))

    logger.info(
        "Admin action: upload_images by=%s files=%s",
        current_admin.email,
        len(saved_files),
    )
    return saved_files
