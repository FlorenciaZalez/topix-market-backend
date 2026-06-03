from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.category import create_category, delete_category, get_categories, update_category


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryResponse]:
    categories = get_categories(db)
    return [CategoryResponse.model_validate(category) for category in categories]


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category_endpoint(
    payload: CategoryCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> CategoryResponse:
    category = create_category(db, payload)
    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category_endpoint(
    category_id: int,
    payload: CategoryUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> CategoryResponse:
    category = update_category(db, category_id, payload)
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}", status_code=204)
def delete_category_endpoint(
    category_id: int,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Response:
    delete_category(db, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)