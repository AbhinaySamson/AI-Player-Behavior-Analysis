from pymongo import MongoClient

# Local MongoDB connection
client = MongoClient("mongodb://localhost:27017/")

# Create database
db = client["ai_player_behavior_db"]

# Collections
users_collection = db["users"]
games_collection = db["games"]
predictions_collection = db["predictions"]