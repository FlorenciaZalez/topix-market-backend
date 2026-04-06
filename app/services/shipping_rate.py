from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.shipping_rate import ShippingRate
from app.schemas.shipping_rate import ShippingRateCreate, ShippingRateUpdate


def get_shipping_rates(db: Session) -> list[ShippingRate]:
    statement = select(ShippingRate).order_by(ShippingRate.cp_from.asc(), ShippingRate.cp_to.asc())
    return list(db.scalars(statement))


def get_shipping_rate(db: Session, shipping_rate_id: int) -> ShippingRate:
    shipping_rate = db.get(ShippingRate, shipping_rate_id)
    if not shipping_rate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipping rate not found")
    return shipping_rate


def _ensure_no_overlap(db: Session, cp_from: int, cp_to: int, shipping_rate_id: int | None = None) -> None:
    statement = select(ShippingRate).where(
        or_(
            ShippingRate.cp_from.between(cp_from, cp_to),
            ShippingRate.cp_to.between(cp_from, cp_to),
            (ShippingRate.cp_from <= cp_from) & (ShippingRate.cp_to >= cp_to),
        )
    )
    if shipping_rate_id is not None:
        statement = statement.where(ShippingRate.id != shipping_rate_id)

    if db.scalar(statement):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Shipping rate range overlaps an existing rate")


def create_shipping_rate(db: Session, payload: ShippingRateCreate) -> ShippingRate:
    _ensure_no_overlap(db, payload.cp_from, payload.cp_to)

    shipping_rate = ShippingRate(cp_from=payload.cp_from, cp_to=payload.cp_to, price=payload.price)
    db.add(shipping_rate)
    db.commit()
    db.refresh(shipping_rate)
    return shipping_rate


def update_shipping_rate(db: Session, shipping_rate_id: int, payload: ShippingRateUpdate) -> ShippingRate:
    shipping_rate = get_shipping_rate(db, shipping_rate_id)
    _ensure_no_overlap(db, payload.cp_from, payload.cp_to, shipping_rate_id=shipping_rate_id)

    shipping_rate.cp_from = payload.cp_from
    shipping_rate.cp_to = payload.cp_to
    shipping_rate.price = payload.price
    db.commit()
    db.refresh(shipping_rate)
    return shipping_rate


def delete_shipping_rate(db: Session, shipping_rate_id: int) -> None:
    shipping_rate = get_shipping_rate(db, shipping_rate_id)
    db.delete(shipping_rate)
    db.commit()