# FILE: backend/app/models/response_model.py
# ------------------------------------------
# This file defines the Pydantic models for Response data.

from pydantic import BaseModel, Field
from datetime import datetime

class ResponseBase(BaseModel):
    response_text: str = Field(..., max_length=5000)

class ResponseCreate(ResponseBase):
    pass

class ResponsePublic(ResponseBase):
    id: str
    rfp_id: str
    supplier_id: str
    document_url: str
    submitted_at: datetime