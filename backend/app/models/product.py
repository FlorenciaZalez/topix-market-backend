import json
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


product_categories = Table(
    "product_categories",
    Base.metadata,
    Column("product_id", ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    is_on_sale: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    categories = relationship("Category", secondary=product_categories, back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")

    @property
    def category_ids(self) -> list[int]:
        return [category.id for category in self.categories]


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    color: Mapped[str] = mapped_column(String(80), nullable=False)
    color_hex: Mapped[str | None] = mapped_column(String(7), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_urls_raw: Mapped[str] = mapped_column("image_urls", Text, nullable=False, default="[]", server_default="[]")
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")

    @property
    def image_urls(self) -> list[str]:
        if not self.image_urls_raw:
            return [self.image_url] if self.image_url else []

        try:
            parsed_image_urls = json.loads(self.image_urls_raw)
        except json.JSONDecodeError:
            return [self.image_url] if self.image_url else []

        if not isinstance(parsed_image_urls, list):
            return [self.image_url] if self.image_url else []

        normalized_image_urls = [image_url for image_url in parsed_image_urls if isinstance(image_url, str) and image_url]
        return normalized_image_urls or ([self.image_url] if self.image_url else [])

    @image_urls.setter
    def image_urls(self, value: list[str] | None) -> None:
        normalized_image_urls = [image_url.strip() for image_url in (value or []) if isinstance(image_url, str) and image_url.strip()]
        self.image_urls_raw = json.dumps(normalized_image_urls)
        self.image_url = normalized_image_urls[0] if normalized_image_urls else None
