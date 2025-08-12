# FILE: backend/app/services/cloudinary_service.py
# ------------------------------------------------
# This service handles all interactions with the Cloudinary API.

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()
cloudinary.config(secure=True)

def upload_file(file, folder: str, original_filename: str):
    """
    Uploads a file to Cloudinary, ensuring the public ID is based on the
    original filename for a better user experience on download.
    """
    try:
        filename_base = Path(original_filename).stem
        file_ext = Path(original_filename).suffix

        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder,
            public_id=filename_base+file_ext, # Use the original name as the base ID
            unique_filename=False,   # Don't add random characters to the name we provided
            overwrite=True,          # Overwrite if a file with this ID exists
            resource_type="auto"
        )
        # Now, we get the secure URL and add the download flag
        secure_url = upload_result.get("secure_url")
        if not secure_url:
            return None

        # To force a download, we insert the 'fl_attachment' flag
        # into the URL's transformation section.
        parts = secure_url.split('/upload/')
        if len(parts) == 2:
            download_url = f"{parts[0]}/upload/fl_attachment/{parts[1]}"
            return download_url
        else:
            return secure_url

    except Exception as e:
        print(f"Error interacting with Cloudinary: {e}")
        return None