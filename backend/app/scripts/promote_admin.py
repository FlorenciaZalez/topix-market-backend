from collections.abc import Callable

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.user import User


def promote_admin(email: str, printer: Callable[[str], None] = print) -> int:
    normalized_email = email.strip().lower()
    if not normalized_email:
        printer("Email is required")
        return 1

    with SessionLocal() as session:
        user = session.scalar(select(User).where(User.email == normalized_email))
        if not user:
            printer(f"User not found: {normalized_email}")
            return 1

        if user.is_admin:
            printer(f"User {normalized_email} is already an admin")
            return 0

        user.is_admin = True
        session.commit()
        printer(f"User {normalized_email} promoted to admin")
        return 0


def main() -> None:
    try:
        email = input("Enter user email to promote: ").strip()
    except EOFError:
        print("Email input cancelled")
        return

    promote_admin(email)


if __name__ == "__main__":
    main()
