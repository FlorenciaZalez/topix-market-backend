# Topix Market Backend

## Run locally

1. Create a Python environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and update the values.
4. Start the API with `uvicorn app.main:app --reload`.

## Admin user setup

1. Register a normal user through the API or frontend.
2. From `backend/`, run `python promote_admin.py`.
3. Enter the user email when prompted.

The script promotes the user by setting `is_admin = True`. If the user does not exist, it prints a clear message and exits safely.

The application creates tables automatically on startup. For production, replace that with migrations.