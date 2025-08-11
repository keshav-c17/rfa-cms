# FILE: backend/app/apis/rfps.py
# ------------------------------
# This file contains the API endpoints for managing RFPs.

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from ..models.rfp_model import RFPPublic, RFPStatusUpdate
from ..models.user_model import UserInDB
from ..core.security import get_current_user
from ..services.email_service import send_email_simulation
from ..db.database import rfp_collection, response_collection, user_collection
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
    - Suppliers see RFPs that are 'Published' or have responses.
    - Buyers see all RFPs they have created.
    """
    if current_user.role == "Supplier":
        # A supplier should see all RFPs that are open for submission.
        query = {"status": {"$in": ["Published", "Response Submitted"]}}
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

@router.get("/{rfp_id}", response_model=RFPPublic)
async def get_rfp_by_id(rfp_id: str, current_user: UserInDB = Depends(get_current_user)):
    """
    Retrieves a single RFP by its ID with corrected authorization checks.
    """
    try:
        obj_id = ObjectId(rfp_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid RFP ID format")

    rfp = rfp_collection.find_one({"_id": obj_id})
    if rfp is None:
        raise HTTPException(status_code=404, detail="RFP not found")

    # Authorization check
    if current_user.role == 'Buyer':
        if str(rfp["buyer_id"]) != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this RFP")
    elif current_user.role == 'Supplier':
        has_submitted = response_collection.find_one({"rfp_id": obj_id, "supplier_id": ObjectId(current_user.id)})
        # A supplier can view if it's open for bidding OR if they have already submitted.
        if rfp["status"] not in ["Published", "Response Submitted"] and not has_submitted:
             raise HTTPException(status_code=403, detail="This RFP is not available for viewing")

    rfp["id"] = str(rfp["_id"])
    rfp["buyer_id"] = str(rfp["buyer_id"])
    
    return RFPPublic(**rfp)
    
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


@router.put("/{rfp_id}", response_model=RFPPublic)
async def update_rfp(
        rfp_id: str,
        title: str = Form(...),
        description: str = Form(...),
        file: UploadFile = File(...),
        current_user: UserInDB = Depends(get_current_user)
):
    """
    Updates an existing RFP's details and document.
    Serves as a basic version control mechanism.
    """
    try:
        obj_id = ObjectId(rfp_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid RFP ID format")

    # Verify ownership
    rfp = rfp_collection.find_one({"_id": obj_id})
    if rfp is None:
        raise HTTPException(status_code=404, detail="RFP not found")
    if str(rfp["buyer_id"]) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this RFP")

    # Save the new file version
    uploads_dir = BASE_DIR / "uploads"
    file_path = uploads_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update the RFP document in the database
    update_data = {
        "$set": {
            "title": title,
            "description": description,
            "document_url": f"uploads/{file.filename}",
            "updated_at": datetime.now(timezone.utc)
        }
    }
    rfp_collection.update_one({"_id": obj_id}, update_data)

    # Fetch and return the updated document
    updated_rfp = rfp_collection.find_one({"_id": obj_id})
    updated_rfp["id"] = str(updated_rfp["_id"])
    updated_rfp["buyer_id"] = str(updated_rfp["buyer_id"])

    return RFPPublic(**updated_rfp)


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

    # --- EMAIL NOTIFICATION LOGIC ---
    # If the status is changing to 'Published', notify all suppliers.
    if status_update.status == "Published":
        # Find all supplier emails
        suppliers = user_collection.find({"role": "Supplier"}, {"email": 1})
        supplier_emails = [supplier["email"] for supplier in suppliers]
        
        for email in supplier_emails:
            send_email_simulation(
                to_email=email,
                subject=f"New RFP Published: {rfp['title']}",
                body=f"A new RFP titled '{rfp['title']}' has been published. Please log in to view the details."
            )
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

@router.delete("/{rfp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rfp(rfp_id: str, current_user: UserInDB = Depends(get_current_user)):
    """
    Deletes an RFP. Only the owner can delete, and only if it's a draft.
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
        raise HTTPException(status_code=403, detail="Not authorized to delete this RFP")

    # Check if the RFP is a draft
    if rfp["status"] != "Draft":
        raise HTTPException(status_code=400, detail="Cannot delete an RFP that is not a draft")

    rfp_collection.delete_one({"_id": obj_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)