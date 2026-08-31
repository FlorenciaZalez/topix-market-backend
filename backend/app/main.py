from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import ensure_schema_updates
from app.routes import admin, auth, bank_details, categories, home_content, orders, payments, products, shipping_rates, uploads


ensure_schema_updates()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(bank_details.router, prefix="/api")
app.include_router(home_content.router, prefix="/api")
app.include_router(shipping_rates.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
