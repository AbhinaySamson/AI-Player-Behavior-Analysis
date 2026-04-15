from flask import Blueprint, request, jsonify
import bcrypt
from datetime import datetime

from models.user_model import create_user, find_user_by_email

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    if find_user_by_email(data["email"]):
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    user = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed_pw,
        "role": "player",

        "xp": 0,
        "level": 1,

        "total_games": 0,
        "total_wins": 0,
        "win_rate": 0,

        "skill_level": "Beginner",

        "created_at": datetime.utcnow()
    }

    create_user(user)

    return jsonify({"message": "User registered successfully"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = find_user_by_email(data["email"])

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user["password"]
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user_id": str(user["_id"]),
        "name": user["name"],
        "level": user.get("level", "Beginner"),
        "xp": user.get("xp", 0),
    })