## Database Schema

The application uses a NoSQL database (MongoDB) with three main collections:

### `users`

-   `_id`: ObjectId
    
-   `username`: String
    
-   `email`: String (unique)
    
-   `password`: String (hashed)
    
-   `role`: String ("Buyer" or "Supplier")
    

### `rfps`

-   `_id`: ObjectId
    
-   `title`: String
    
-   `description`: String
    
-   `status`: String ("Draft", "Published", etc.)
    
-   `buyer_id`: ObjectId (references a user)
    
-   `document_url`: String (path to the uploaded file)
    
-   `created_at`: Timestamp
    
-   `updated_at`: Timestamp
    

### `responses`

-   `_id`: ObjectId
    
-   `rfp_id`: ObjectId (references an RFP)
    
-   `supplier_id`: ObjectId (references a user)
    
-   `response_text`: String
    
-   `document_url`: String (path to the uploaded file)
    
-   `status`: String ("Submitted", "Approved", "Rejected")
    
-   `submitted_at`: Timestamp