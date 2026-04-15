from flask import Blueprint, request, jsonify
from datetime import datetime
from bson.objectid import ObjectId
from utils.db import games_collection, users_collection

game_bp = Blueprint("game", __name__)
@game_bp.route("/save", methods=["POST"])
def save_game():
    try:
        data = request.json

        required_fields = [
            "user_id",
            "game_type",
            "moves",
            "mistakes",
            "time_taken",
            "optimal_moves"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        xp_earned = max(1, data["optimal_moves"] - data["mistakes"])

        game = {
            "user_id": ObjectId(data["user_id"]),
            "game_type": data["game_type"],
            "moves": data["moves"],
            "mistakes": data["mistakes"],
            "time_taken": data["time_taken"],
            "optimal_moves": data["optimal_moves"],
            "xp_earned": xp_earned,
            "created_at": datetime.utcnow()
        }

        games_collection.insert_one(game)

        users_collection.update_one(
            {"_id": ObjectId(data["user_id"])},
            {"$inc": {"xp": xp_earned}}
        )

        return jsonify({"message": "Game saved"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500