import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile

from app.core.config import settings
from app.deps import get_current_admin
from app.models.user import User


router = APIRouter(prefix="/uploads", tags=["uploads"])
logger = logging.getLogger(__name__)


def build_upload_public_path(filename: str) -> str:
    return f"/{settings.uploads_dir}/{filename}"


@router.post("/images", response_model=list[str])
async def upload_images(
    files: list[UploadFile] = File(...),
    current_admin: User = Depends(get_current_admin),
) -> list[str]:
    upload_dir = Path(settings.uploads_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved_files: list[str] = []
    for file in files:
        extension = Path(file.filename or "").suffix or ".jpg"
        filename = f"{uuid4().hex}{extension}"
        destination = upload_dir / filename
        contents = await file.read()
        destination.write_bytes(contents)
        saved_files.append(build_upload_public_path(filename))

    logger.info("Admin action: upload_images by=%s files=%s", current_admin.email, len(saved_files))
    return saved_files
