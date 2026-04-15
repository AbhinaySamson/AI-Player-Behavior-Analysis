from flask import Blueprint, jsonify
from services.ml_service import predict_user_behavior
from services.model_evaluation_service import get_model_evaluation

ml_bp = Blueprint("ml", __name__)

@ml_bp.route("/predict-behavior/<user_id>", methods=["GET"])
def predict_behavior(user_id):

    behavior = predict_user_behavior(user_id)

    if not behavior:
        return jsonify({"error": "Model not trained or insufficient data"}), 400

    return jsonify({
        "ai_behavior_classification": behavior
    })




@ml_bp.route("/model-report", methods=["GET"])
def model_report():

    report = get_model_evaluation()

    if not report:
        return {"error": "Model not trained"}, 400

    return report