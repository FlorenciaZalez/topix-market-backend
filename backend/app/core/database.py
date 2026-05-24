from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings


engine = create_engine(settings.database_url, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def ensure_schema_updates() -> None:
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as connection:
        if "categories" in existing_tables:
            category_columns = {column["name"] for column in inspect(engine).get_columns("categories")}
            if "image_url" not in category_columns:
                connection.execute(text("ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) NULL"))

        if "products" in existing_tables:
            product_columns = {column["name"] for column in inspect(engine).get_columns("products")}
            if "category_id" not in product_columns:
                connection.execute(text("ALTER TABLE products ADD COLUMN category_id INTEGER NULL"))

            foreign_keys = {foreign_key["name"] for foreign_key in inspect(engine).get_foreign_keys("products")}
            if "fk_products_category_id" not in foreign_keys:
                connection.execute(
                    text(
                        "ALTER TABLE products ADD CONSTRAINT fk_products_category_id "
                        "FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL"
                    )
                )

        if "product_variants" in existing_tables:
            variant_columns = {column["name"] for column in inspect(engine).get_columns("product_variants")}
            if "color_hex" not in variant_columns:
                connection.execute(text("ALTER TABLE product_variants ADD COLUMN color_hex VARCHAR(7) NULL"))
            if "image_url" not in variant_columns:
                connection.execute(text("ALTER TABLE product_variants ADD COLUMN image_url VARCHAR(500) NULL"))

        if "orders" in existing_tables:
            order_columns = {column["name"] for column in inspect(engine).get_columns("orders")}
            if "payment_method" not in order_columns:
                connection.execute(
                    text("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(32) NOT NULL DEFAULT 'mercado_pago'")
                )
            if "delivery_address" not in order_columns:
                connection.execute(text("ALTER TABLE orders ADD COLUMN delivery_address VARCHAR(500) NULL"))

            # Normalize legacy enum-like values stored with enum names instead of enum values.
            connection.execute(
                text(
                    "UPDATE orders SET payment_method = CASE "
                    "WHEN payment_method = 'MERCADO_PAGO' THEN 'mercado_pago' "
                    "WHEN payment_method = 'BANK_TRANSFER' THEN 'bank_transfer' "
                    "ELSE LOWER(payment_method) END"
                )
            )

        if "bank_details" in existing_tables:
            bank_columns = {column["name"] for column in inspect(engine).get_columns("bank_details")}
            if "contact_phone" not in bank_columns:
                connection.execute(text("ALTER TABLE bank_details ADD COLUMN contact_phone VARCHAR(64) NOT NULL DEFAULT ''"))

        if "home_content" in existing_tables:
            home_content_columns = {column["name"] for column in inspect(engine).get_columns("home_content")}
            if "hero_image_url" not in home_content_columns:
                connection.execute(text("ALTER TABLE home_content ADD COLUMN hero_image_url VARCHAR(500) NOT NULL DEFAULT ''"))
            if "new_arrivals_image_url" not in home_content_columns:
                connection.execute(text("ALTER TABLE home_content ADD COLUMN new_arrivals_image_url VARCHAR(500) NOT NULL DEFAULT ''"))



def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
