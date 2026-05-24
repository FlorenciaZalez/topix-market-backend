import mercadopago
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.order import Order, PaymentMethod, ShippingMethod


def create_payment_preference(order: Order) -> dict:
    if order.payment_method != PaymentMethod.MERCADO_PAGO:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order payment method is not Mercado Pago")

    if not settings.mercado_pago_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mercado Pago access token is not configured",
        )

    sdk = mercadopago.SDK(settings.mercado_pago_access_token)
    items = []
    for item in order.items:
        items.append(
            {
                "title": f"{item.product.name} - {item.variant.color}",
                "quantity": item.quantity,
                "currency_id": "ARS",
                "unit_price": float(item.unit_price),
            }
        )

    if order.shipping_method == ShippingMethod.FLAT:
        items.append(
            {
                "title": "Flat shipping",
                "quantity": 1,
                "currency_id": "ARS",
                "unit_price": float(order.shipping_price),
            }
        )

    preference_data = {
        "items": items,
        "external_reference": str(order.id),
        "back_urls": {
            "success": settings.mercado_pago_success_url,
            "failure": settings.mercado_pago_failure_url,
            "pending": settings.mercado_pago_pending_url,
        },
        "auto_return": "approved",
        "statement_descriptor": "TOPIX MARKET",
    }

    response = sdk.preference().create(preference_data)
    if response.get("status") not in {200, 201}:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Failed to create payment preference")

    return response["response"]
