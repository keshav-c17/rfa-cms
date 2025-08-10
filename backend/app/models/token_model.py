# FILE: backend/app/models/token_model.py
# ---------------------------------------
# This file defines the model for JWT token response.

from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None