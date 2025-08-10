# FILE: backend/app/models/rfp_model.py
# -------------------------------------
# This file defines the Pydantic models for RFP data.

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class RFPBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., max_length=5000)

class RFPCreate(RFPBase):
    pass

class RFPPublic(RFPBase):
    id: str
    status: Literal["Draft", "Published", "Under Review", "Approved", "Rejected"]
    buyer_id: str
    created_at: datetime
    updated_at: datetime

class RFPStatusUpdate(BaseModel):
    status: Literal["Draft", "Published", "Under Review", "Approved", "Rejected"]