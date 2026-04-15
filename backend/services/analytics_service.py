from utils.db import games_collection
from bson.objectid import ObjectId
import numpy as np


def calculate_user_analytics(user_id):

    games = list(games_collection.find({
        "user_id": ObjectId(user_id)
    }).sort("created_at", 1))

    if not games:
        return None

    total_games = len(games)

    total_time = 0
    total_moves = 0
    total_mistakes = 0
    total_optimal = 0

    xp_timeline = []
    reaction_times = []

    per_game_stats = {}

    cumulative_xp = 0

    for g in games:

        game_type = g.get("game_type", "unknown")
        moves = g.get("moves", 0)
        mistakes = g.get("mistakes", 0)
        time_taken = g.get("time_taken", 0)
        optimal = g.get("optimal_moves", 0)
        xp = g.get("xp_earned", 0)

        cumulative_xp += xp
        xp_timeline.append(cumulative_xp)

        total_time += time_taken
        total_moves += moves
        total_mistakes += mistakes
        total_optimal += optimal

        if "reaction_variance" in g:
            reaction_times.append(time_taken)

        if game_type not in per_game_stats:
            per_game_stats[game_type] = {
                "count": 0,
                "moves": 0,
                "mistakes": 0,
                "time": 0,
                "optimal": 0
            }

        per_game_stats[game_type]["count"] += 1
        per_game_stats[game_type]["moves"] += moves
        per_game_stats[game_type]["mistakes"] += mistakes
        per_game_stats[game_type]["time"] += time_taken
        per_game_stats[game_type]["optimal"] += optimal

    avg_time = total_time / total_games if total_games > 0 else 0
    avg_moves = total_moves / total_games if total_games > 0 else 0

    accuracy = ((total_moves - total_mistakes) / total_moves) * 100 if total_moves > 0 else 0

    valid_games = [g for g in games if g.get("optimal_moves", 0) > 0]

    valid_moves = sum(g.get("moves", 0) for g in valid_games)
    valid_optimal = sum(g.get("optimal_moves", 0) for g in valid_games)

    efficiency = (valid_optimal / valid_moves) * 100 if valid_moves > 0 else 0

    decision_speed = avg_time / avg_moves if avg_moves > 0 else 0

    mistake_rate = (total_mistakes / total_moves) * 100 if total_moves > 0 else 0

    fatigue_index = np.var(reaction_times) if reaction_times else 0

    per_game = []

    for game_type, stats in per_game_stats.items():

        g_moves = stats["moves"]
        g_mistakes = stats["mistakes"]
        g_time = stats["time"]
        g_optimal = stats["optimal"]

        g_efficiency = (g_optimal / g_moves) * 100 if g_moves > 0 and g_optimal > 0 else 0
        g_accuracy = ((g_moves - g_mistakes) / g_moves) * 100 if g_moves > 0 else 0
        g_avg_time = g_time / stats["count"] if stats["count"] > 0 else 0

        per_game.append({
            "game_type": game_type,
            "games_played": stats["count"],
            "efficiency": round(g_efficiency, 2),
            "accuracy": round(g_accuracy, 2),
            "avg_time": round(g_avg_time, 2),
            "decision_speed": round(g_avg_time / g_moves, 4) if g_moves > 0 else 0
        })

    return {
        "total_games": total_games,
        "xp": cumulative_xp,
        "xp_timeline": xp_timeline,
        "reaction_times": reaction_times,
        "per_game": per_game,
        "overall_behavior": {
            "accuracy": round(accuracy, 2),
            "efficiency": round(efficiency, 2),
            "decision_speed": round(decision_speed, 4),
            "mistake_rate": round(mistake_rate, 2),
            "fatigue_index": round(fatigue_index, 2)
        }
    }