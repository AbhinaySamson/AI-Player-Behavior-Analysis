import numpy as np
import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from datetime import datetime
from utils.db import games_collection


GAME_TYPES = ["tic_tac_toe", "grid_path", "memory", "time_pressure"]


def extract_features(g):
    moves = g.get("moves", 0)
    mistakes = g.get("mistakes", 0)
    optimal = g.get("optimal_moves", 0)
    time_taken = g.get("time_taken", 0)

    if moves == 0:
        return None

    accuracy = ((moves - mistakes) / moves) * 100
    efficiency = (optimal / moves) * 100
    decision_speed = time_taken / moves
    mistake_rate = (mistakes / moves) * 100

    return [accuracy, efficiency, decision_speed, mistake_rate]


def generate_behavior_map(kmeans, X_scaled):
    centers = kmeans.cluster_centers_

    # Sort clusters based on efficiency (key insight)
    cluster_scores = []

    for i, center in enumerate(centers):
        accuracy, efficiency, speed, mistake = center

        score = efficiency - mistake  # simple intelligence metric

        cluster_scores.append((i, score))

    # Sort descending
    cluster_scores.sort(key=lambda x: x[1], reverse=True)

    behavior_map = {}

    for rank, (cluster_id, _) in enumerate(cluster_scores):
        if rank == 0:
            behavior_map[cluster_id] = "Strategic Player"
        elif rank == 1:
            behavior_map[cluster_id] = "Balanced Performer"
        else:
            behavior_map[cluster_id] = "Inconsistent Player"

    return behavior_map


def train_per_game():

    overall_report = {}

    for game_type in GAME_TYPES:

        games = list(games_collection.find({"game_type": game_type}))

        dataset = []

        for g in games:
            features = extract_features(g)
            if features:
                dataset.append(features)

        X = np.array(dataset)

        if len(X) < 5:
            print(f"Not enough data for {game_type}")
            continue

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=3, random_state=42)
        kmeans.fit(X_scaled)

        silhouette = silhouette_score(X_scaled, kmeans.labels_)

        behavior_map = generate_behavior_map(kmeans, X_scaled)

        # Save per-game models
        joblib.dump(kmeans, f"ml/{game_type}_model.pkl")
        joblib.dump(scaler, f"ml/{game_type}_scaler.pkl")
        joblib.dump(behavior_map, f"ml/{game_type}_map.pkl")

        overall_report[game_type] = {
            "samples": len(X),
            "silhouette_score": round(float(silhouette), 4),
            "behavior_map": behavior_map
        }

        print(f"{game_type} trained | Samples: {len(X)} | Score: {silhouette}")

    joblib.dump(overall_report, "ml/model_report.pkl")


if __name__ == "__main__":
    train_per_game()