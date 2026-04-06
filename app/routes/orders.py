from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order import create_order, get_user_orders


router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderResponse])
def list_user_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[OrderResponse]:
    orders = get_user_orders(db, current_user.id)
    return [OrderResponse.model_validate(order) for order in orders]


@router.post("", response_model=OrderResponse, status_code=201)
def create_user_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderResponse:
    order = create_order(db, current_user, payload)
    return OrderResponse.model_validate(order)
