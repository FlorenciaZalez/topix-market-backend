from pydantic import BaseModel, ConfigDict


class HomeContentBase(BaseModel):
    hero_image_url: str
    new_arrivals_image_url: str


class HomeContentUpdate(HomeContentBase):
    pass


class HomeContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hero_image_url: str
    new_arrivals_image_url: str