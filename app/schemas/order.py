from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, PaymentMethod, ShippingMethod
from app.schemas.auth import UserResponse
from app.schemas.product import ProductResponse, ProductVariantResponse


class OrderItemCreate(BaseModel):
    product_id: int
    variant_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_method: ShippingMethod
    payment_method: PaymentMethod = PaymentMethod.MERCADO_PAGO
    delivery_address: str = Field(min_length=10, max_length=500)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quantity: int
    unit_price: Decimal
    product: ProductResponse
    variant: ProductVariantResponse


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user: UserResponse | None = None
    status: OrderStatus
    payment_method: PaymentMethod
    shipping_method: ShippingMethod
    delivery_address: str | None
    shipping_price: Decimal
    subtotal: Decimal
    total: Decimal
    payment_reference: str | None
    created_at: datetime
    items: list[OrderItemResponse]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class PaymentPreferenceRequest(BaseModel):
    order_id: int


class PaymentPreferenceResponse(BaseModel):
    init_point: str
    preference_id: str
