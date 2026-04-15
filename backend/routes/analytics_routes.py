from flask import Blueprint, jsonify
from services.behavior_service import get_user_behavior_dashboard

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/user/<user_id>", methods=["GET"])
def user_analytics(user_id):
    try:
        data = get_user_behavior_dashboard(user_id)

        if not data:
            return jsonify({
                "xp": 0,
                "level": 1,
                "overall_behavior": {},
                "per_game": []
            }), 200

        return jsonify(data), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500