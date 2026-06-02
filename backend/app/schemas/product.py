from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse


class ProductVariantBase(BaseModel):
    color: str
    color_hex: str | None = None
    image_url: str | None = None
    stock: int = Field(ge=0, default=0)


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantResponse(ProductVariantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class ProductBase(BaseModel):
    category_ids: list[int] = Field(default_factory=list)
    name: str
    description: str
    price: Decimal
    sale_price: Decimal | None = None
    is_on_sale: bool = False
    image_urls: list[str] = Field(default_factory=list)
    variants: list[ProductVariantCreate] = Field(default_factory=list)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_ids: list[int] | None = None
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    sale_price: Decimal | None = None
    is_on_sale: bool | None = None
    image_urls: list[str] | None = None
    variants: list[ProductVariantCreate] | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_ids: list[int]
    name: str
    slug: str
    description: str
    price: Decimal
    sale_price: Decimal | None
    is_on_sale: bool
    categories: list[CategoryResponse]
    images: list[ProductImageResponse]
    variants: list[ProductVariantResponse]
