from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models.user import User
from app.schemas.shipping_rate import ShippingRateCreate, ShippingRateResponse, ShippingRateUpdate
from app.services.shipping_rate import create_shipping_rate, delete_shipping_rate, get_shipping_rates, update_shipping_rate


router = APIRouter(prefix="/shipping-rates", tags=["shipping-rates"])


@router.get("", response_model=list[ShippingRateResponse])
def list_shipping_rates(db: Session = Depends(get_db)) -> list[ShippingRateResponse]:
    shipping_rates = get_shipping_rates(db)
    return [ShippingRateResponse.model_validate(shipping_rate) for shipping_rate in shipping_rates]


@router.post("", response_model=ShippingRateResponse, status_code=201)
def create_shipping_rate_endpoint(
    payload: ShippingRateCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ShippingRateResponse:
    shipping_rate = create_shipping_rate(db, payload)
    return ShippingRateResponse.model_validate(shipping_rate)


@router.put("/{shipping_rate_id}", response_model=ShippingRateResponse)
def update_shipping_rate_endpoint(
    shipping_rate_id: int,
    payload: ShippingRateUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ShippingRateResponse:
    shipping_rate = update_shipping_rate(db, shipping_rate_id, payload)
    return ShippingRateResponse.model_validate(shipping_rate)


@router.delete("/{shipping_rate_id}", status_code=204)
def delete_shipping_rate_endpoint(
    shipping_rate_id: int,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Response:
    delete_shipping_rate(db, shipping_rate_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)