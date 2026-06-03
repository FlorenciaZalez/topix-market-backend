from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.product import ProductResponse
from app.services.product import get_product, get_products


router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)) -> list[ProductResponse]:
    products = get_products(db)
    return [ProductResponse.model_validate(product) for product in products]


@router.get("/{product_id}", response_model=ProductResponse)
def retrieve_product(product_id: int, db: Session = Depends(get_db)) -> ProductResponse:
    product = get_product(db, product_id)
    return ProductResponse.model_validate(product)
