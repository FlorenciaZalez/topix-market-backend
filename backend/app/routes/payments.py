from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.order import PaymentPreferenceRequest, PaymentPreferenceResponse
from app.services.order import get_order
from app.services.payment import create_payment_preference


router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/preference", response_model=PaymentPreferenceResponse)
def generate_preference(
    payload: PaymentPreferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaymentPreferenceResponse:
    order = get_order(db, payload.order_id)
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Order does not belong to the authenticated user",
        )

    preference = create_payment_preference(order)
    order.payment_reference = preference["id"]
    db.commit()
    return PaymentPreferenceResponse(init_point=preference["init_point"], preference_id=preference["id"])
