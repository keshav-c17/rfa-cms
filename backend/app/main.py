from fastapi import FastAPI
from .apis import auth, rfps
from .db.database import client

app = FastAPI(
    title="RFP Contract Management System API",
    description="API for managing RFPs, responses, and users.",
    version="1.0.0"
)

# Include the authentication router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(rfps.router, prefix="/api/rfps", tags=["RFPs"])

@app.on_event("startup")
def startup_db_client():
    """Connect to the database on startup."""
    try:
        client.admin.command('ping')
        print("Successfully connected to MongoDB.")
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