import re

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant
from app.schemas.product import ProductCreate, ProductUpdate


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _build_unique_slug(db: Session, name: str, product_id: int | None = None) -> str:
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while True:
        query = select(Product).where(Product.slug == slug)
        if product_id is not None:
            query = query.where(Product.id != product_id)
        if not db.scalar(query):
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


def _sync_images(product: Product, image_urls: list[str]) -> None:
    product.images.clear()
    for index, url in enumerate(image_urls):
        product.images.append(ProductImage(url=url, position=index))


def _sync_variants(product: Product, variants: list[dict]) -> None:
    existing_variants = list(product.variants)

    for index, variant in enumerate(variants):
        if index < len(existing_variants):
            current_variant = existing_variants[index]
            current_variant.color = variant["color"]
            current_variant.color_hex = variant.get("color_hex")
            current_variant.image_url = variant.get("image_url")
            current_variant.stock = variant["stock"]
            continue

        product.variants.append(
            ProductVariant(
                color=variant["color"],
                color_hex=variant.get("color_hex"),
                image_url=variant.get("image_url"),
                stock=variant["stock"],
            )
        )

    variants_to_remove = existing_variants[len(variants) :]
    for variant in variants_to_remove:
        if variant.order_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove variants that are already used in orders",
            )
        product.variants.remove(variant)


def _get_categories(db: Session, category_ids: list[int]) -> list[Category]:
    unique_category_ids = list(dict.fromkeys(category_ids))
    if not unique_category_ids:
        return []

    categories = list(db.scalars(select(Category).where(Category.id.in_(unique_category_ids))))
    categories_by_id = {category.id: category for category in categories}
    missing_category_ids = [category_id for category_id in unique_category_ids if category_id not in categories_by_id]
    if missing_category_ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return [categories_by_id[category_id] for category_id in unique_category_ids]


def get_products(db: Session) -> list[Product]:
    statement = (
        select(Product)
        .options(selectinload(Product.categories), selectinload(Product.images), selectinload(Product.variants))
        .order_by(Product.id.desc())
    )
    return list(db.scalars(statement).unique())


def get_product(db: Session, product_id: int) -> Product:
    statement = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.categories), selectinload(Product.images), selectinload(Product.variants))
    )
    product = db.scalar(statement)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(
        name=payload.name,
        slug=_build_unique_slug(db, payload.name),
        description=payload.description,
        price=payload.price,
        sale_price=payload.sale_price,
        is_on_sale=payload.is_on_sale,
    )
    product.categories = _get_categories(db, payload.category_ids)
    _sync_images(product, payload.image_urls)
    _sync_variants(product, [variant.model_dump() for variant in payload.variants])
    db.add(product)
    db.commit()
    return get_product(db, product.id)


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    updates = payload.model_dump(exclude_unset=True)

    if "category_ids" in updates:
        product.categories = _get_categories(db, updates["category_ids"])
    if "name" in updates:
        product.name = updates["name"]
        product.slug = _build_unique_slug(db, updates["name"], product_id=product.id)
    if "description" in updates:
        product.description = updates["description"]
    if "price" in updates:
        product.price = updates["price"]
    if "sale_price" in updates:
        product.sale_price = updates["sale_price"]
    if "is_on_sale" in updates:
        product.is_on_sale = updates["is_on_sale"]
    if "image_urls" in updates and updates["image_urls"] is not None:
        _sync_images(product, updates["image_urls"])
    if "variants" in updates and updates["variants"] is not None:
        _sync_variants(product, updates["variants"])

    db.commit()
    return get_product(db, product.id)


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    if product.order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a product that is already used in orders",
        )
    db.delete(product)
    db.commit()
