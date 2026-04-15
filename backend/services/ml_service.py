import joblib
import numpy as np
import os


def load_model(game_type):
    model_path = f"ml/{game_type}_model.pkl"
    scaler_path = f"ml/{game_type}_scaler.pkl"
    map_path = f"ml/{game_type}_map.pkl"

    if not (os.path.exists(model_path) and 
            os.path.exists(scaler_path) and 
            os.path.exists(map_path)):
        return None, None, None

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    behavior_map = joblib.load(map_path)

    return model, scaler, behavior_map


def generate_explanation(features):

    accuracy = features.get("accuracy", 0)
    efficiency = features.get("efficiency", 0)
    mistake_rate = features.get("mistake_rate", 0)
    decision_speed = features.get("decision_speed", 0)

    if efficiency > 80 and mistake_rate < 15:
        return "Strong strategic planning with minimal errors."
    elif accuracy > 75:
        return "Consistent and stable performance across decisions."
    elif mistake_rate > 30:
        return "Frequent mistakes indicate difficulty under pressure."
    elif decision_speed < 1:
        return "Fast decisions indicate strong reaction ability."
    else:
        return "Balanced performance with moderate adaptability."


def predict_user_behavior(game_type, features_dict):

    model, scaler, behavior_map = load_model(game_type)

    if not model:
        return None

    accuracy = features_dict.get("accuracy", 0)
    efficiency = features_dict.get("efficiency", 0)
    decision_speed = features_dict.get("decision_speed", 0)
    mistake_rate = features_dict.get("mistake_rate", 0)

    features = np.array([[accuracy, efficiency, decision_speed, mistake_rate]])

    scaled = scaler.transform(features)

    cluster = model.predict(scaled)[0]

    centroid = model.cluster_centers_[cluster]
    distance = np.linalg.norm(scaled - centroid)

    all_distances = [
        np.linalg.norm(scaled - c) for c in model.cluster_centers_
    ]

    max_distance = max(all_distances)

    confidence = 1 - (distance / (max_distance + 1e-5))
    confidence = max(0, min(1, confidence))
    confidence = round(confidence * 100, 2)

    return {
        "label": behavior_map.get(cluster, "Balanced Performer"),
        "confidence": confidence,
        "explanation": generate_explanation(features_dict)
    }