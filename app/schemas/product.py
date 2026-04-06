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
    category_id: int | None = None
    name: str
    description: str
    price: Decimal
    sale_price: Decimal | None = None
    is_on_sale: bool = False
    image_urls: list[str] = []
    variants: list[ProductVariantCreate] = []


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: int | None = None
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
    category_id: int | None
    name: str
    slug: str
    description: str
    price: Decimal
    sale_price: Decimal | None
    is_on_sale: bool
    category: CategoryResponse | None
    images: list[ProductImageResponse]
    variants: list[ProductVariantResponse]
