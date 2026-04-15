from utils.db import games_collection, users_collection
from bson.objectid import ObjectId
from services.level_service import calculate_level
from services.ml_service import predict_user_behavior
from sklearn.linear_model import LinearRegression
import numpy as np


def detect_trend(values):
    if len(values) < 3:
        return "Insufficient Data"

    if values[-1] > values[0]:
        return "Improving"
    elif values[-1] < values[0]:
        return "Declining"
    else:
        return "Stable"


def get_user_behavior_dashboard(user_id):

    user_id_obj = ObjectId(user_id)

    games = list(
        games_collection.find({"user_id": user_id_obj})
        .sort("created_at", 1)
    )

    user = users_collection.find_one({"_id": user_id_obj})

    if not user:
        return None

    xp = user.get("xp", 0)

    if not games:
        return {
            "xp": xp,
            "level": calculate_level(xp),
            "overall_behavior": {},
            "per_game": [],
            "xp_timeline": [],
            "reaction_times": [],
            "efficiency_timeline": [],
            "predicted_efficiency": []
        }

    total_moves = 0
    total_mistakes = 0
    total_optimal = 0
    total_time = 0

    xp_timeline = []
    reaction_times = []
    efficiency_timeline = []

    cumulative_xp = 0
    per_game_stats = {}

    for g in games:

        moves = g.get("moves", 0)
        mistakes = g.get("mistakes", 0)
        optimal = g.get("optimal_moves", 0)
        time_taken = g.get("time_taken", 0)
        xp_earned = g.get("xp_earned", 0)

        total_moves += moves
        total_mistakes += mistakes
        total_optimal += optimal
        total_time += time_taken

        cumulative_xp += xp_earned
        xp_timeline.append(cumulative_xp)

        if time_taken > 0:
            reaction_times.append(time_taken)

        efficiency = (optimal / moves) * 100 if moves > 0 else 0
        efficiency_timeline.append(round(efficiency, 2))

        game_type = g.get("game_type", "unknown")

        if game_type not in per_game_stats:
            per_game_stats[game_type] = {
                "games_played": 0,
                "moves": 0,
                "mistakes": 0,
                "optimal": 0,
                "total_time": 0
            }

        per_game_stats[game_type]["games_played"] += 1
        per_game_stats[game_type]["moves"] += moves
        per_game_stats[game_type]["mistakes"] += mistakes
        per_game_stats[game_type]["optimal"] += optimal
        per_game_stats[game_type]["total_time"] += time_taken

    # -------------------------
    # Overall metrics (NO ML)
    # -------------------------
    if total_moves > 0:
        accuracy = ((total_moves - total_mistakes) / total_moves) * 100
        efficiency = (total_optimal / total_moves) * 100
        decision_speed = total_time / total_moves
        mistake_rate = (total_mistakes / total_moves) * 100
    else:
        accuracy = efficiency = decision_speed = mistake_rate = 0

    fatigue_index = np.var(reaction_times) if reaction_times else 0
    performance_trend = detect_trend(efficiency_timeline)

    # -------------------------
    # Prediction (unchanged)
    # -------------------------
    predicted_efficiency = []
    prediction_confidence = 0

    if len(efficiency_timeline) >= 3:
        X = np.array(range(len(efficiency_timeline))).reshape(-1, 1)
        y = np.array(efficiency_timeline)

        model = LinearRegression()
        model.fit(X, y)

        r2_score = model.score(X, y)
        prediction_confidence = round(max(0, min(1, r2_score)) * 100, 2)

        future_indices = np.array(
            range(len(efficiency_timeline), len(efficiency_timeline) + 3)
        ).reshape(-1, 1)

        predicted_efficiency = [
            round(float(p), 2) for p in model.predict(future_indices)
        ]


    per_game_result = []
    meta_features = []

    for game_type, stats in per_game_stats.items():

        g_moves = stats["moves"]
        g_mistakes = stats["mistakes"]
        g_optimal = stats["optimal"]
        g_time = stats["total_time"]
        g_count = stats["games_played"]

        if g_moves > 0:
            g_accuracy = ((g_moves - g_mistakes) / g_moves) * 100
            g_efficiency = (g_optimal / g_moves) * 100
            g_decision_speed = g_time / g_moves
            g_mistake_rate = (g_mistakes / g_moves) * 100
        else:
            g_accuracy = g_efficiency = g_decision_speed = g_mistake_rate = 0

        features = {
            "accuracy": g_accuracy,
            "efficiency": g_efficiency,
            "decision_speed": g_decision_speed,
            "mistake_rate": g_mistake_rate
        }

        # 🔥 AI per game
        ml_result = predict_user_behavior(game_type, features)

        per_game_result.append({
            "game_type": game_type,
            "games_played": g_count,
            "avg_accuracy": round(g_accuracy, 2),
            "avg_efficiency": round(g_efficiency, 2),
            "behavior": ml_result["label"] if ml_result else "Unknown",
            "confidence": ml_result["confidence"] if ml_result else 0,
            "explanation": ml_result["explanation"] if ml_result else ""
        })

        # collect for meta-model later
        meta_features.extend([
            g_accuracy,
            g_efficiency,
            g_decision_speed,
            g_mistake_rate
        ])
    comparison = []

    for g in per_game_result:
        comparison.append(f"{g['game_type']} → {g['behavior']}")

    comparison_summary = " | ".join(comparison)


    return {
        "xp": xp,
        "level": calculate_level(xp),
        "per_game": per_game_result,
        "xp_timeline": xp_timeline,
        "reaction_times": reaction_times,
        "efficiency_timeline": efficiency_timeline,
        "predicted_efficiency": predicted_efficiency,
        "prediction_confidence": prediction_confidence,
        "comparison_summary": comparison_summary,
        "meta_features": meta_features  # for next step
    }