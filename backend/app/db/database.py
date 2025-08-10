# FILE: backend/app/db/database.py
# --------------------------------
# This file handles the MongoDB connection.

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_CLUSTER_URL = os.getenv("MONGO_CLUSTER_URL")

if not MONGO_CLUSTER_URL:
    raise ValueError("MONGO_CLUSTER_URL environment variable not set!")

client = MongoClient(MONGO_CLUSTER_URL)
database = client.rfp_system # The database name

# Get collections
user_collection = database.get_collection("users")
rfp_collection = database.get_collection("rfps")
response_collection = database.get_collection("responses")
