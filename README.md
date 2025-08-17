
# RFP Contract Management System

This is a full-stack web application built for a coding assignment. It serves as a complete Request for Proposal (RFP) management system, allowing "Buyers" to create and manage RFPs and "Suppliers" to browse and respond to them. The application is built with a modern technology stack and demonstrates a complete, production-ready workflow.

## Live Demo

- **Frontend (Vercel):** [https://rfa-cms.vercel.app/](https://rfa-cms.vercel.app/)
- **Backend API (Railway):** [https://rfa-cms-production.up.railway.app/](https://rfa-cms-production.up.railway.app/)
- **API Documentation (Swagger):** [https://rfa-cms-production.up.railway.app/docs](https://rfa-cms-production.up.railway.app/docs)
    
## Architecture Overview

This application is built using a decoupled, full-stack architecture with a distinct frontend and backend.

-   **Backend:** The backend is designed as a **Modular Monolith** using Python and FastAPI. While it is a single, deployable application, the codebase is logically separated into modules (e.g., authentication, RFPs, responses) to ensure maintainability and a clear separation of concerns. It follows RESTful principles for its API design and handles all business logic, database interactions, and user authentication.
    
-   **Frontend:** The frontend is a **Single Page Application (SPA)** built with React and TypeScript. It is responsible for all user interface rendering and state management. The application is structured with a clear separation of components, pages, and services. All communication with the backend is handled through asynchronous API calls using Axios.
    
-   **Authentication Flow:** The system uses **JSON Web Tokens (JWT)** for secure authentication. When a user logs in, the backend validates their credentials and issues a short-lived JWT containing their identity and role (`Buyer` or `Supplier`). This token is stored on the frontend and sent in the authorization header of every subsequent API request. The backend validates this token on protected endpoints to authenticate the user and enforce role-based access control.
    
-   **Data Flow:** The user interacts with the React UI, which sends requests to the FastAPI backend. The backend processes these requests, interacts with the MongoDB Atlas database for data persistence, and returns a JSON response to the frontend, which then updates the UI.

## Features Implemented

### 1. User Management & Authentication

-   **User Registration:** Users can sign up with a unique email and select a role (`Buyer` or `Supplier`).
    
-   **JWT Authentication:** Secure login system that provides a JSON Web Token for accessing protected routes.
    
-   **Role-Based Access Control:** The API and UI are strictly controlled by user roles. Buyers can only perform buyer actions, and suppliers can only perform supplier actions.
    

### 2. Full RFP Lifecycle Management

-   **Create & Publish:** Buyers can create new RFPs in a "Draft" state. They can then "Publish" them, making them visible to all suppliers.
    
-   **Browse & Respond:** Suppliers have a dashboard where they can see all "Published" RFPs. They can view the details of an RFP and submit a response, including a document upload.
    
-   **Review & Decide:** Buyers have a detailed view for each of their RFPs where they can see all submitted responses. They can move the RFP to an "Under Review" status.
    
-   **Approve/Reject:** From the review page, buyers can approve a winning response (which automatically rejects all others) or reject individual responses.
    
-   **Complete Status Tracking:** The application correctly tracks and displays the full status lifecycle: `Draft` → `Published` → `Response Submitted` → `Under Review` → `Approved` / `Rejected`.
    

### 3. Document & Data Management

-   **File Uploads:** Both buyers (when creating an RFP) and suppliers (when submitting a response) can upload document files, which are stored and served by the backend.
    
-   **Full-Text Search:** The supplier dashboard includes a search bar to perform a full-text search across the titles and descriptions of all published RFPs.
    
-   **Version Control:** Buyers can update the details and document of an existing RFP, providing a basic version control mechanism.
    
-   **Data Integrity:** The system correctly handles data relationships, ensuring buyers can only see their own RFPs and suppliers can only see public or relevant information.

## Limitations & Future Improvements

This application was built to meet the core requirements of the assignment within a limited timeframe. As such, certain features were implemented in a simplified manner suitable for a demo.

-   **Ephemeral File Storage:** The application uses the local filesystem on the Railway server for document uploads. This is an **ephemeral** (temporary) storage. Any uploaded files will be **deleted** whenever the backend application restarts or redeploys. For a production environment, this would be replaced with a persistent storage solution like AWS S3 or Cloudinary.
    
-   **Simulated Email Notifications:** As per the assignment guidelines, email notifications are simulated by logging the email content to the backend console. No actual emails are sent.
    
-   **Simplified RFP Award Logic:** When a buyer approves one response, the system automatically rejects all other pending responses and closes the RFP. A more advanced system would allow for more granular control over the award process.
    
-   **Basic Real-time Updates:** The UI updates by re-fetching data after a user performs an action. True real-time updates (e.g., a buyer seeing a new response appear without refreshing) would require implementing WebSockets. 

## Technology Stack

-   **Backend:** Python with FastAPI
    
-   **Frontend:** React with TypeScript
    
-   **Database:** MongoDB Atlas
    
-   **Styling:** Tailwind CSS
    
-   **Deployment:**
    
    -   Backend deployed on Railway.
        
    -   Frontend deployed on Vercel.
        

## Local Setup and Installation

### Prerequisites

-   Node.js (v18 or later)
    
-   Python 3.9+
    
-   A MongoDB Atlas account
    

### Backend Setup

1.  Navigate to the `backend/` directory.
    
2.  Create and activate a virtual environment:
    
    ```
    python -m venv venv
    source venv/bin/activate
    
    ```
    
3.  Install the required packages:
    
    ```
    pip install -r requirements.txt
    
    ```
    
4.  Create a `.env` file in the `backend/` root and add your environment variables:
    
    ```
    MONGO_CLUSTER_URL="your_mongodb_atlas_connection_string"
    JWT_SECRET_KEY="your_super_secret_key"
    JWT_ALGORITHM="HS256"
    
    ```
    
5.  Run the development server:
    
    ```
    uvicorn app.main:app --reload
    
    ```
    
    The backend will be running at `http://127.0.0.1:8000`.
    

### Frontend Setup

1.  Navigate to the `frontend/` directory.
    
2.  Install the required packages:
    
    ```
    npm install
    
    ```
    
3.  Create a `.env` file in the `frontend/` root and add the backend API URL:
    
    ```
    REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
    
    ```
    
4.  Run the development server:
    
    ```
    npm start
    
    ```
    
    The frontend will be running at `http://localhost:3000`.
    

## API Documentation

The API is self-documenting thanks to FastAPI and the OpenAPI standard. The interactive Swagger UI can be accessed at the `/docs` endpoint of the backend.

**Live API Docs:** [https://rfa-cms-production.up.railway.app/docs](https://rfa-cms-production.up.railway.app/docs)

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
    

## AI Usage Report

Throughout this project, I leveraged an AI assistant (Gemini) to significantly improve productivity and act as a development partner. The AI's role was primarily in the following areas:

1.  **Boilerplate Code Generation:** The AI was instrumental in quickly generating the initial project structure for both the FastAPI backend and the React frontend. It provided the foundational code for database connections, Pydantic models, React components, and API service files, which saved a significant amount of time on setup.
    
2.  **Debugging and Troubleshooting:** The AI served as an interactive debugger. When faced with errors (such as CORS issues, dependency conflicts, or deployment crashes), I was able to provide the traceback or error message directly to the AI. It quickly analyzed the problem and provided the correct, context-aware solution, which dramatically reduced the time spent on debugging.
    
3.  **Architectural Discussion and Refinement:** I used the AI as a sounding board to discuss architectural decisions, such as choosing a modular monolith over microservices and refining the business logic for RFP and response statuses. The AI provided clear explanations of trade-offs and helped ensure the final logic was robust and aligned with real-world use cases. This collaborative process led to a better-designed and more thoughtful final product.
    

## Test Credentials

-   **Buyer Account:**
    
    -   **Email:**  `buyer@test.com`
        
    -   **Password:**  `password123`
        
-   **Supplier Account:**
    
    -   **Email:**  `supplier@test.com`
        
    -   **Password:**  `password123`

-   **Supplier-2 Account:**
    
    -   **Email:**  `supplier2@test.com`
        
    -   **Password:**  `password123`