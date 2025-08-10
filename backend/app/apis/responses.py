# FILE: backend/app/apis/responses.py
# -----------------------------------
# This file contains all API endpoints related to RFP responses.

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from ..models.response_model import ResponsePublic, ResponseStatusUpdate
from ..models.user_model import UserInDB
from ..core.security import get_current_user
from ..db.database import rfp_collection, response_collection
from bson import ObjectId
from datetime import datetime, timezone
import shutil
from pathlib import Path
from typing import List

router = APIRouter()

# Define the base directory of the backend project to resolve file paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent

@router.get("/submissions/my", response_model=List[ResponsePublic])
async def get_my_submissions(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role != "Supplier":
        raise HTTPException(status_code=403, detail="Only Suppliers can view their submissions.")

    # Use an aggregation pipeline to join with RFPs and get the title
    pipeline = [
        {"$match": {"supplier_id": ObjectId(current_user.id)}},
        {
            "$lookup": {
                "from": "rfps",
                "localField": "rfp_id",
                "foreignField": "_id",
                "as": "rfp_details"
            }
        },
        {"$unwind": "$rfp_details"},
        {
            "$project": {
                "id": {"$toString": "$_id"},
                "rfp_id": {"$toString": "$rfp_id"},
                "supplier_id": {"$toString": "$supplier_id"},
                "response_text": 1,
                "document_url": 1,
                "status": 1,
                "submitted_at": 1,
                "rfp_title": "$rfp_details.title" # Include the title
            }
        }
    ]
    
    responses_cursor = response_collection.aggregate(pipeline)
    return list(responses_cursor)

@router.get("/{rfp_id}/responses", response_model=List[ResponsePublic])
async def list_responses_for_rfp(
    rfp_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Lists all responses for a specific RFP.
    Only accessible by the Buyer who created the RFP.
    """
    try:
        rfp_obj_id = ObjectId(rfp_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid RFP ID format")

    rfp = rfp_collection.find_one({"_id": rfp_obj_id})
    if rfp is None:
        raise HTTPException(status_code=404, detail="RFP not found")

    if str(rfp["buyer_id"]) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view responses for this RFP")

    responses_cursor = response_collection.find({"rfp_id": rfp_obj_id})
    
    response_list = []
    for response in responses_cursor:
        response["id"] = str(response["_id"])
        response["rfp_id"] = str(response["rfp_id"])
        response["supplier_id"] = str(response["supplier_id"])
        response_list.append(ResponsePublic(**response))
        
    return response_list

@router.post("/{rfp_id}/responses", response_model=ResponsePublic, status_code=status.HTTP_201_CREATED)
async def submit_response(
    rfp_id: str,
    response_text: str = Form(...),
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Submits a response to a specific RFP. Only accessible by Suppliers.
    """
    if current_user.role != "Supplier":
        raise HTTPException(status_code=403, detail="Only Suppliers can submit responses.")

    try:
        rfp_obj_id = ObjectId(rfp_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid RFP ID format")

    # Check if the RFP exists and is published
    rfp = rfp_collection.find_one({"_id": rfp_obj_id})
    if rfp is None or rfp.get("status") not in ["Published", "Response Submitted"]:
        raise HTTPException(status_code=404, detail="RFP is not open for responses.")

    # Save the uploaded file locally using an absolute path
    uploads_dir = BASE_DIR / "uploads"
    file_path = uploads_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create the response document
    response_data = {
        "rfp_id": rfp_obj_id,
        "supplier_id": ObjectId(current_user.id),
        "response_text": response_text,
        "document_url": f"uploads/{file.filename}",
        "status": "Submitted",  # Initial status for a new response
        "submitted_at": datetime.now(timezone.utc)
    }
    result = response_collection.insert_one(response_data)

    # Update the RFP status to 'Response Submitted'
    rfp_collection.update_one(
        {"_id": rfp_obj_id},
        {"$set": {"status": "Response Submitted", "updated_at": datetime.now(timezone.utc)}}
    )

    # Fetch and return the created response
    created_response = response_collection.find_one({"_id": result.inserted_id})
    created_response["id"] = str(created_response["_id"])
    created_response["rfp_id"] = str(created_response["rfp_id"])
    created_response["supplier_id"] = str(created_response["supplier_id"])

    return ResponsePublic(**created_response)


@router.patch("/{rfp_id}/responses/{response_id}/status", response_model=ResponsePublic)
async def update_response_status(
    rfp_id: str,
    response_id: str,
    status_update: ResponseStatusUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Approves or rejects a specific response.
    Only accessible by the Buyer who created the RFP.
    """
    try:
        rfp_obj_id = ObjectId(rfp_id)
        response_obj_id = ObjectId(response_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    # Verify the RFP exists and the user owns it
    rfp = rfp_collection.find_one({"_id": rfp_obj_id})
    if rfp is None or str(rfp["buyer_id"]) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this RFP's responses")

    # Update the specific response's status
    response_collection.update_one(
        {"_id": response_obj_id, "rfp_id": rfp_obj_id},
        {"$set": {"status": status_update.status}}
    )

    # If a response is approved OR rejected, update the main RFP's status
    if status_update.status in ["Approved", "Rejected"]:
        rfp_collection.update_one(
            {"_id": rfp_obj_id},
            {"$set": {"status": status_update.status, "updated_at": datetime.now(timezone.utc)}}
        )

    # Fetch and return the updated response
    updated_response = response_collection.find_one({"_id": response_obj_id})
    if updated_response is None:
        raise HTTPException(status_code=404, detail="Response not found")
        
    updated_response["id"] = str(updated_response["_id"])
    updated_response["rfp_id"] = str(updated_response["rfp_id"])
    updated_response["supplier_id"] = str(updated_response["supplier_id"])
    
    return ResponsePublic(**updated_response)
