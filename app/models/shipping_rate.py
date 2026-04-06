from decimal import Decimal

from sqlalchemy import Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ShippingRate(Base):
    __tablename__ = "shipping_rates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    cp_from: Mapped[int] = mapped_column(nullable=False, index=True)
    cp_to: Mapped[int] = mapped_column(nullable=False, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)