from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    slug: str | None = None
    image_url: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str
    slug: str | None = None
    image_url: str | None = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    image_url: str | None