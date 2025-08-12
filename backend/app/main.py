from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .apis import auth, rfps, responses
from .db.database import client
import os
from pathlib import Path

# Define the base directory of the backend project
BASE_DIR = Path(__file__).resolve().parent.parent

# Create the uploads directory immediately when the script is loaded.
# This ensures it exists before FastAPI tries to mount it.
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True) # exist_ok=True prevents an error if it already exists

app = FastAPI(
    title="RFP Contract Management System API",
    description="API for managing RFPs, responses, and users.",
    version="1.0.0"
)

app.mount("/uploads", StaticFiles(directory=BASE_DIR / "uploads"), name="uploads")

# --- CORS Middleware Configuration ---
# Read allowed origins from an environment variable.
# The variable should be a comma-separated string of URLs.
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")

origins = [origin.strip() for origin in CORS_ORIGINS.split(",")]
origins.append("http://192.168.1.9:3000") # local network pc

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
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