from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.bank_details import BankDetails
from app.schemas.bank_details import BankDetailsUpdate


def get_bank_details(db: Session) -> BankDetails:
    bank_details = db.get(BankDetails, 1)
    if not bank_details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank details not configured")
    return bank_details


def upsert_bank_details(db: Session, payload: BankDetailsUpdate) -> BankDetails:
    bank_details = db.get(BankDetails, 1)
    if not bank_details:
        bank_details = BankDetails(id=1, **payload.model_dump())
        db.add(bank_details)
    else:
        bank_details.bank_name = payload.bank_name.strip()
        bank_details.account_holder = payload.account_holder.strip()
        bank_details.cbu = payload.cbu.strip()
        bank_details.alias = payload.alias.strip()
        bank_details.cuit = payload.cuit.strip()
        bank_details.contact_phone = payload.contact_phone.strip()

    db.commit()
    db.refresh(bank_details)
    return bank_details