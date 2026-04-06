from pydantic import BaseModel, ConfigDict


class BankDetailsBase(BaseModel):
    bank_name: str
    account_holder: str
    cbu: str
    alias: str
    cuit: str
    contact_phone: str


class BankDetailsUpdate(BankDetailsBase):
    pass


class BankDetailsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bank_name: str
    account_holder: str
    cbu: str
    alias: str
    cuit: str
    contact_phone: str