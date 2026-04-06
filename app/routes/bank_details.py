from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models.user import User
from app.schemas.bank_details import BankDetailsResponse, BankDetailsUpdate
from app.services.bank_details import get_bank_details, upsert_bank_details


router = APIRouter(prefix="/bank-details", tags=["bank-details"])


@router.get("", response_model=BankDetailsResponse)
def read_bank_details(db: Session = Depends(get_db)) -> BankDetailsResponse:
    bank_details = get_bank_details(db)
    return BankDetailsResponse.model_validate(bank_details)


@router.put("", response_model=BankDetailsResponse)
def save_bank_details(
    payload: BankDetailsUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> BankDetailsResponse:
    bank_details = upsert_bank_details(db, payload)
    return BankDetailsResponse.model_validate(bank_details)