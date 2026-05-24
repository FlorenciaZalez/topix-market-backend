from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BankDetails(Base):
    __tablename__ = "bank_details"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_holder: Mapped[str] = mapped_column(String(255), nullable=False)
    cbu: Mapped[str] = mapped_column(String(64), nullable=False)
    alias: Mapped[str] = mapped_column(String(255), nullable=False)
    cuit: Mapped[str] = mapped_column(String(32), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(64), nullable=False, default='')