from sqlalchemy.orm import Session

from app.models.home_content import HomeContent
from app.schemas.home_content import HomeContentUpdate


def get_or_create_home_content(db: Session) -> HomeContent:
    home_content = db.get(HomeContent, 1)
    if not home_content:
        home_content = HomeContent(id=1, hero_image_url="", new_arrivals_image_url="")
        db.add(home_content)
        db.commit()
        db.refresh(home_content)
    return home_content


def update_home_content(db: Session, payload: HomeContentUpdate) -> HomeContent:
    home_content = get_or_create_home_content(db)
    home_content.hero_image_url = payload.hero_image_url.strip()
    home_content.new_arrivals_image_url = payload.new_arrivals_image_url.strip()
    db.commit()
    db.refresh(home_content)
    return home_content