from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class HomeContent(Base):
    __tablename__ = "home_content"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    hero_image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    new_arrivals_image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")