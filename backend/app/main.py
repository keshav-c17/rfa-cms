from fastapi import FastAPI
from .apis import auth, rfps, responses
from .db.database import client
import os
from pathlib import Path # Import Path

# Define the base directory of the backend project
BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(
    title="RFP Contract Management System API",
    description="API for managing RFPs, responses, and users.",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(rfps.router, prefix="/api/rfps", tags=["RFPs"])
app.include_router(responses.router, prefix="/api/rfps", tags=["Responses"])

@app.on_event("startup")
def startup_db_client():
    """Connect to the database and create uploads directory on startup."""
    try:
        client.admin.command('ping')
        print("Successfully connected to MongoDB.")
        # Create uploads directory using an absolute path
        uploads_dir = BASE_DIR / "uploads"
        if not uploads_dir.exists():
            uploads_dir.mkdir()
            print(f"Created '{uploads_dir}' directory.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

@app.on_event("shutdown")
def shutdown_db_client():
    """Close the database connection on shutdown."""
    client.close()
    print("MongoDB connection closed.")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the RFP System API"}