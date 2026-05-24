import logging

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.auth import get_all_users
from app.services.order import get_all_orders, update_order_status
from app.services.product import create_product, delete_product, get_product, get_products, update_product


router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


@router.get("/products", response_model=list[ProductResponse])
def admin_list_products(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[ProductResponse]:
    products = get_products(db)
    return [ProductResponse.model_validate(product) for product in products]


@router.post("/products", response_model=ProductResponse, status_code=201)
def admin_create_product(
    payload: ProductCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ProductResponse:
    product = create_product(db, payload)
    logger.info("Admin action: create_product by=%s product_id=%s", current_admin.email, product.id)
    return ProductResponse.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(
    product_id: int,
    payload: ProductUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ProductResponse:
    product = update_product(db, product_id, payload)
    logger.info("Admin action: update_product by=%s product_id=%s", current_admin.email, product.id)
    return ProductResponse.model_validate(product)


@router.delete("/products/{product_id}", status_code=204)
def admin_delete_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Response:
    delete_product(db, product_id)
    logger.info("Admin action: delete_product by=%s product_id=%s", current_admin.email, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/orders", response_model=list[OrderResponse])
def admin_list_orders(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[OrderResponse]:
    orders = get_all_orders(db)
    return [OrderResponse.model_validate(order) for order in orders]


@router.patch("/orders/{order_id}", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> OrderResponse:
    order = update_order_status(db, order_id, payload.status)
    logger.info(
        "Admin action: update_order_status by=%s order_id=%s status=%s",
        current_admin.email,
        order.id,
        payload.status,
    )
    return OrderResponse.model_validate(order)


@router.get("/users", response_model=list[UserResponse])
def admin_list_users(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[UserResponse]:
    users = get_all_users(db)
    return [UserResponse.model_validate(user) for user in users]
