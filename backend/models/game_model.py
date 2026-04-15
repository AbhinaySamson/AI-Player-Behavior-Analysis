from utils.db import games_collection
from bson.objectid import ObjectId
from datetime import datetime


def create_game(game_data):
    """
    Creates a standardized game document
    for ALL game types.
    """

    game_document = {
        "user_id": ObjectId(game_data["user_id"]),
        "game_type": game_data["game_type"],

        "time_taken": float(game_data.get("time_taken", 0)),
        "moves": int(game_data.get("moves", 0)),
        "mistakes": int(game_data.get("mistakes", 0)),

        "accuracy": float(game_data.get("accuracy", 0)),
        "efficiency": float(game_data.get("efficiency", 0)),
        "decision_speed": float(game_data.get("decision_speed", 0)),

        "xp_earned": int(game_data.get("xp_earned", 0)),

        "created_at": datetime.utcnow()
    }

    return games_collection.insert_one(game_document)


def get_games_by_user(user_id):
    return list(
        games_collection.find(
            {"user_id": ObjectId(user_id)}
        )
    )


def get_all_games():
    return list(games_collection.find())