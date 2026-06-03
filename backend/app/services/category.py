import re

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _build_unique_slug(db: Session, value: str, category_id: int | None = None) -> str:
    base_slug = slugify(value)
    slug = base_slug
    counter = 1
    while True:
        query = select(Category).where(Category.slug == slug)
        if category_id is not None:
            query = query.where(Category.id != category_id)
        if not db.scalar(query):
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


def get_categories(db: Session) -> list[Category]:
    statement = select(Category).order_by(Category.name.asc())
    return list(db.scalars(statement))


def get_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def create_category(db: Session, payload: CategoryCreate) -> Category:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name is required")

    existing_name = db.scalar(select(Category).where(Category.name.ilike(name)))
    if existing_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")

    slug_source = payload.slug.strip() if payload.slug else name
    image_url = payload.image_url.strip() if payload.image_url else None
    category = Category(name=name, slug=_build_unique_slug(db, slug_source), image_url=image_url)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, payload: CategoryUpdate) -> Category:
    category = get_category(db, category_id)

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name is required")

    existing_name = db.scalar(select(Category).where(Category.name.ilike(name), Category.id != category_id))
    if existing_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")

    slug_source = payload.slug.strip() if payload.slug else name
    category.name = name
    category.slug = _build_unique_slug(db, slug_source, category_id=category_id)
    category.image_url = payload.image_url.strip() if payload.image_url else None
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_category(db, category_id)
    db.delete(category)
    db.commit()