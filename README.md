# Topix Market

Aplicacion full-stack de e-commerce con FastAPI, PostgreSQL, React, TypeScript, Tailwind CSS, Framer Motion y JWT.

## Estructura

- `backend/`: API modular con rutas, modelos, esquemas y servicios.
- `frontend/`: storefront y panel admin con React + Vite.
- `docker-compose.yml`: PostgreSQL local.

## Backend

1. Crear y activar un entorno Python.
2. Instalar dependencias con `pip install -r requirements.txt` dentro de `backend/`.
3. Copiar `.env.example` a `.env` dentro de `backend/`.
4. Levantar PostgreSQL con `docker compose up -d` en la raiz.
5. Iniciar la API con `uvicorn app.main:app --reload` desde `backend/`.

## Frontend

1. Instalar dependencias con `npm install` dentro de `frontend/`.
2. Copiar `.env.example` a `.env` dentro de `frontend/`.
3. Iniciar Vite con `npm run dev`.

## Acceso admin

El modelo de usuario incluye `is_admin`. Puedes promover un usuario desde `backend/` ejecutando:

`python promote_admin.py`

El script pide el email por consola, promueve al usuario si existe y falla de forma segura si no lo encuentra.