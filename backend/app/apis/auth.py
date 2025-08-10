# FILE: backend/app/apis/auth.py
# ------------------------------
# This file contains the API endpoints for authentication (regist

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from ..models.user_model import UserCreate, UserPublic
from ..models.token_model import Token
from ..db.database import user_collection
from ..core.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from bson import ObjectId
from datetime import timedelta

router = APIRouter()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """
    Handles user registration.
    - Hashes the password.
    - Checks if the email already exists.
    - Saves the new user to the database.
    """
    # Check if user already exists
    existing_user = user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create user document
    user_data = user.dict()
    user_data.pop("password")  # Remove plain password
    user_data["hashed_password"] = hashed_password

    # Insert new user into the database
    result = user_collection.insert_one(user_data)

    # Fetch the created user to return its public data
    created_user = user_collection.find_one({"_id": result.inserted_id})

    # Convert ObjectId to string for the response model
    created_user["id"] = str(created_user["_id"])

    return UserPublic(**created_user)


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Handles user login and returns a JWT token.
    - Uses OAuth2PasswordRequestForm for standard form data (username, password).
    """
    user = user_collection.find_one({"email": form_data.username})  # Note: username is the email
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}