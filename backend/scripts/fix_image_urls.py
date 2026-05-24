"""
Script para migrar URLs de imágenes de http:// a https:// en la base de datos.

Uso:
    python scripts/fix_image_urls.py

El script usa DATABASE_URL y BACKEND_URL del archivo .env del backend.
"""

import sys
from pathlib import Path

# Agregar el directorio raíz del backend al path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine


def fix_http_to_https(old_origin: str, new_origin: str) -> None:
    """Reemplaza old_origin por new_origin en todas las columnas de imagen."""
    tables_columns = [
        ("product_images", "url"),
        ("product_variants", "image_url"),
        ("categories", "image_url"),
        ("home_content", "hero_image_url"),
        ("home_content", "new_arrivals_image_url"),
    ]

    with engine.begin() as conn:
        total_updated = 0
        for table, column in tables_columns:
            result = conn.execute(
                text(
                    f"UPDATE {table} "
                    f"SET {column} = REPLACE({column}, :old, :new) "
                    f"WHERE {column} LIKE :pattern"
                ),
                {"old": old_origin, "new": new_origin, "pattern": f"{old_origin}%"},
            )
            rows = result.rowcount
            total_updated += rows
            if rows:
                print(f"  {table}.{column}: {rows} fila(s) actualizada(s)")

        print(f"\nTotal: {total_updated} URL(s) actualizadas.")


if __name__ == "__main__":
    backend_url = settings.backend_url.rstrip("/")

    if backend_url.startswith("https://"):
        old_origin = backend_url.replace("https://", "http://", 1)
        new_origin = backend_url
    elif backend_url.startswith("http://"):
        print(f"BACKEND_URL es http:// ({backend_url}). Nada que migrar en desarrollo.")
        sys.exit(0)
    else:
        print(f"BACKEND_URL no reconocida: {backend_url}")
        sys.exit(1)

    print(f"Migrando URLs de:\n  {old_origin}  →  {new_origin}\n")
    fix_http_to_https(old_origin, new_origin)
