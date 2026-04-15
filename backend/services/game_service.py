# services/game_service.py

from models.game_model import create_game
from utils.db import users_collection
from bson.objectid import ObjectId


def calculate_behavior_metrics(data):
    """
    Calculate accuracy, efficiency, decision_speed
    """

    moves = int(data.get("moves", 0))
    mistakes = int(data.get("mistakes", 0))
    time_taken = float(data.get("time_taken", 0))
    optimal_moves = int(data.get("optimal_moves", moves))  # optional

    # Avoid division errors
    if moves == 0:
        accuracy = 0
        decision_speed = 0
    else:
        accuracy = ((moves - mistakes) / moves) * 100
        decision_speed = time_taken / moves

    if optimal_moves == 0:
        efficiency = 0
    else:
        efficiency = (optimal_moves / moves) * 100 if moves != 0 else 0

    return accuracy, efficiency, decision_speed


def calculate_xp(accuracy, efficiency):
    """
    Simple XP formula.
    Can improve later.
    """
    return int((accuracy * 0.6 + efficiency * 0.4) / 5)


def save_game_service(data):
    """
    Main service function for saving a game.
    """

    user_id = data["user_id"]

    accuracy, efficiency, decision_speed = calculate_behavior_metrics(data)

    xp_earned = calculate_xp(accuracy, efficiency)

    game_data = {
        "user_id": user_id,
        "game_type": data["game_type"],
        "time_taken": data.get("time_taken", 0),
        "moves": data.get("moves", 0),
        "mistakes": data.get("mistakes", 0),
        "accuracy": accuracy,
        "efficiency": efficiency,
        "decision_speed": decision_speed,
        "xp_earned": xp_earned
    }

    create_game(game_data)

    # Update user XP
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"xp": xp_earned}}
    )

    # Get updated XP
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    return {
        "message": "Game saved successfully",
        "xp_earned": xp_earned,
        "total_xp": user.get("xp", 0)
    }