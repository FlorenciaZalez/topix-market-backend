from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models.user import User
from app.schemas.home_content import HomeContentResponse, HomeContentUpdate
from app.services.home_content import get_or_create_home_content, update_home_content


router = APIRouter(prefix="/home-content", tags=["home-content"])


@router.get("", response_model=HomeContentResponse)
def read_home_content(db: Session = Depends(get_db)) -> HomeContentResponse:
    home_content = get_or_create_home_content(db)
    return HomeContentResponse.model_validate(home_content)


@router.put("", response_model=HomeContentResponse)
def save_home_content(
    payload: HomeContentUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> HomeContentResponse:
    home_content = update_home_content(db, payload)
    return HomeContentResponse.model_validate(home_content)