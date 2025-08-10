# FILE: backend/app/models/response_model.py
# ------------------------------------------
# This file defines the Pydantic models for Response data.

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class ResponseBase(BaseModel):
    response_text: str = Field(..., max_length=5000)

class ResponseCreate(ResponseBase):
    pass

class ResponsePublic(ResponseBase):
    id: str
    rfp_id: str
    supplier_id: str
    document_url: str
    status: Literal["Submitted", "Approved", "Rejected"]
    submitted_at: datetime

class ResponseStatusUpdate(BaseModel):
    status: Literal["Approved", "Rejected"]