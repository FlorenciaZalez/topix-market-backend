from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod, ShippingMethod
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.order import OrderCreate


def _load_product_variant(db: Session, product_id: int, variant_id: int) -> tuple[Product, ProductVariant]:
    product = db.scalar(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.images), selectinload(Product.variants))
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    variant = next((item for item in product.variants if item.id == variant_id), None)
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    return product, variant


def _resolve_unit_price(product: Product) -> Decimal:
    if product.is_on_sale and product.sale_price is not None:
        return Decimal(product.sale_price)
    return Decimal(product.price)


def get_user_orders(db: Session, user_id: int) -> list[Order]:
    statement = (
        select(Order)
        .where(Order.user_id == user_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.variants),
            selectinload(Order.items).selectinload(OrderItem.variant),
        )
        .order_by(Order.id.desc())
    )
    return list(db.scalars(statement).unique())


def get_all_orders(db: Session) -> list[Order]:
    statement = (
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.variants),
            selectinload(Order.items).selectinload(OrderItem.variant),
            selectinload(Order.user),
        )
        .order_by(Order.id.desc())
    )
    return list(db.scalars(statement).unique())


def get_order(db: Session, order_id: int) -> Order:
    statement = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.variants),
            selectinload(Order.items).selectinload(OrderItem.variant),
        )
    )
    order = db.scalar(statement)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def create_order(db: Session, user: User, payload: OrderCreate) -> Order:
    order = Order(
        user_id=user.id,
        shipping_method=payload.shipping_method,
        payment_method=payload.payment_method,
        delivery_address=payload.delivery_address.strip(),
    )
    subtotal = Decimal("0")

    for item in payload.items:
        product, variant = _load_product_variant(db, item.product_id, item.variant_id)
        unit_price = _resolve_unit_price(product)
        subtotal += unit_price * item.quantity
        order.items.append(
            OrderItem(
                product_id=product.id,
                variant_id=variant.id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
        )

    shipping_price = (
        Decimal(settings.flat_shipping_rate)
        if payload.shipping_method == ShippingMethod.FLAT
        else Decimal("0")
    )
    order.subtotal = subtotal
    order.shipping_price = shipping_price
    order.total = subtotal + shipping_price
    db.add(order)
    db.commit()
    return get_order(db, order.id)


def update_order_status(db: Session, order_id: int, status_value: OrderStatus) -> Order:
    order = get_order(db, order_id)
    order.status = status_value
    db.commit()
    return get_order(db, order.id)
