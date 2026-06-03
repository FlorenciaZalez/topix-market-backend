from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ShippingRateBase(BaseModel):
    cp_from: int = Field(ge=0)
    cp_to: int = Field(ge=0)
    price: Decimal = Field(ge=0)

    @model_validator(mode="after")
    def validate_range(self) -> "ShippingRateBase":
        if self.cp_to < self.cp_from:
            raise ValueError("cp_to must be greater than or equal to cp_from")
        return self


class ShippingRateCreate(ShippingRateBase):
    pass


class ShippingRateUpdate(ShippingRateBase):
    pass


class ShippingRateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cp_from: int
    cp_to: int
    price: Decimal