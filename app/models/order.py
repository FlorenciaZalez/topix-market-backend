from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"


class ShippingMethod(str, Enum):
    FLAT = "flat_rate"
    ARRANGED = "to_be_arranged"


class PaymentMethod(str, Enum):
    MERCADO_PAGO = "mercado_pago"
    BANK_TRANSFER = "bank_transfer"


enum_values = lambda enum_class: [member.value for member in enum_class]


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(SqlEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        SqlEnum(PaymentMethod, values_callable=enum_values, native_enum=False),
        default=PaymentMethod.MERCADO_PAGO,
        nullable=False,
    )
    delivery_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    shipping_method: Mapped[ShippingMethod] = mapped_column(
        SqlEnum(ShippingMethod), default=ShippingMethod.FLAT, nullable=False
    )
    shipping_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    payment_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")
