# FILE: backend/app/apis/rfps.py
# ------------------------------
# This file contains the API endpoints for managing RFPs.

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from ..models.rfp_model import RFPPublic, RFPStatusUpdate
from ..models.user_model import UserInDB
from ..core.security import get_current_user
from ..db.database import rfp_collection
from bson import ObjectId
from datetime import datetime, timezone
from typing import List
import shutil
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent


@router.get("/search", response_model=List[RFPPublic])
async def search_rfps(q: str):
    """
    Performs a full-text search on the 'title' and 'description' of published RFPs.
    """
    query = {
        "$text": {"$search": q},
        "status": "Published"
    }

    # Sort by relevance score
    rfps_cursor = rfp_collection.find(query, {"score": {"$meta": "textScore"}}).sort(
        [("score", {"$meta": "textScore"})])

    rfp_list = []
    for rfp in rfps_cursor:
        rfp["id"] = str(rfp["_id"])
        rfp["buyer_id"] = str(rfp["buyer_id"])
        rfp_list.append(RFPPublic(**rfp))

    return rfp_list


@router.get("/", response_model=List[RFPPublic])
async def list_rfps(current_user: UserInDB = Depends(get_current_user)):
    """
    Lists RFPs based on user role.
    - Suppliers see all 'Published' RFPs.
    - Buyers see all RFPs they have created.
    """
    if current_user.role == "Supplier":
        query = {"status": "Published"}
    elif current_user.role == "Buyer":
        query = {"buyer_id": ObjectId(current_user.id)}
    else:
        # If the user has an unrecognized role, return an empty list for security.
        return []

    rfps_cursor = rfp_collection.find(query)

    rfp_list = []
    for rfp in rfps_cursor:
        rfp["id"] = str(rfp["_id"])
        rfp["buyer_id"] = str(rfp["buyer_id"])
        rfp_list.append(RFPPublic(**rfp))

    return rfp_list


@router.post("/", response_model=RFPPublic, status_code=status.HTTP_201_CREATED)
async def create_rfp(
        title: str = Form(...),
        description: str = Form(...),
        file: UploadFile = File(...),
        current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role != "Buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Buyers can create RFPs."
        )

    uploads_dir = BASE_DIR / "uploads"
    file_path = uploads_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rfp_data = {
        "title": title,
        "description": description,
        "buyer_id": ObjectId(current_user.id),
        "status": "Draft",
        "document_url": f"uploads/{file.filename}",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = rfp_collection.insert_one(rfp_data)

    # Fetch the created RFP to return its public data
    created_rfp = rfp_collection.find_one({"_id": result.inserted_id})

    # Convert ObjectId to string for the response model
    created_rfp["id"] = str(created_rfp["_id"])
    created_rfp["buyer_id"] = str(created_rfp["buyer_id"])

    return RFPPublic(**created_rfp)


@router.patch("/{rfp_id}/status", response_model=RFPPublic)
async def update_rfp_status(
    rfp_id: str,
    status_update: RFPStatusUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Updates the status of an RFP (e.g., from 'Draft' to 'Published').
    Only the Buyer who created the RFP can change its status.
    """
    try:
        obj_id = ObjectId(rfp_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid RFP ID format")

    rfp = rfp_collection.find_one({"_id": obj_id})

    if rfp is None:
        raise HTTPException(status_code=404, detail="RFP not found")

    # Check ownership
    if str(rfp["buyer_id"]) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this RFP")

    # Update the status
    update_data = {
        "$set": {
            "status": status_update.status,
            "updated_at": datetime.now(timezone.utc)
        }
    }
    rfp_collection.update_one({"_id": obj_id}, update_data)

    # Fetch and return the updated document
    updated_rfp = rfp_collection.find_one({"_id": obj_id})
    updated_rfp["id"] = str(updated_rfp["_id"])
    updated_rfp["buyer_id"] = str(updated_rfp["buyer_id"])

    return RFPPublic(**updated_rfp)