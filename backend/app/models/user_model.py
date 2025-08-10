# FILE: backend/app/models/user_model.py
# --------------------------------------
# This file defines the Pydantic models for user data

from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: Literal["Buyer", "Supplier"]

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    id: str
    hashed_password: str

class UserPublic(UserBase):
    id: str