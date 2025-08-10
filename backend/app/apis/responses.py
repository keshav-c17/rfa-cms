from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from ..models.response_model import ResponsePublic
from ..models.user_model import UserInDB
from ..core.security import get_current_user
from ..db.database import rfp_collection, response_collection
from bson import ObjectId
from datetime import datetime, timezone
import shutil
from pathlib import Path # Import Path

router = APIRouter()

# Define the base directory of the backend project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

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
    if rfp is None or rfp.get("status") != "Published":
        raise HTTPException(status_code=404, detail="Published RFP not found.")

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
        "document_url": f"uploads/{file.filename}", # Store relative path in DB
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