from flask import Blueprint, request, jsonify
from services.grid_ai_service import astar, generate_valid_grid

grid_bp = Blueprint("grid", __name__)


@grid_bp.route("/generate", methods=["POST"])
def generate_grid():
    try:
        data = request.json

        size = data.get("size", 6)
        obstacle_prob = data.get("obstacle_prob", 0.3)

        grid = generate_valid_grid(size, obstacle_prob)

        return jsonify({"grid": grid}), 200

    except Exception as e:
        print("ERROR in generate:", str(e))
        return jsonify({"error": str(e)}), 500


@grid_bp.route("/compare", methods=["POST"])
def compare_paths():
    try:
        data = request.json

        grid = data.get("grid")
        start = tuple(data.get("start", [0, 0]))
        goal = tuple(data.get("goal", [5, 5]))
        human_path = data.get("human_path", [])
        time_taken = data.get("time_taken", 0)

        ai_path = astar(grid, start, goal)

        if not ai_path:
            return jsonify({"error": "No valid path found"}), 400

        human_steps = len(human_path)
        ai_steps = len(ai_path)

        extra_steps = human_steps - ai_steps
        efficiency = round((ai_steps / human_steps) * 100, 2) if human_steps > 0 else 0
        mistakes = extra_steps if extra_steps > 0 else 0

        return jsonify({
            "ai_path": ai_path,
            "human_steps": human_steps,
            "ai_steps": ai_steps,
            "extra_steps": extra_steps,
            "efficiency": efficiency,
            "mistakes": mistakes,
            "time_taken": time_taken
        }), 200

    except Exception as e:
        print("ERROR in compare:", str(e))
        return jsonify({"error": str(e)}), 500