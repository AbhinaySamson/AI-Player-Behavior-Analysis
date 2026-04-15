import joblib
import os


def get_model_evaluation():

    if not os.path.exists("ml/model_report.pkl"):
        return None

    report = joblib.load("ml/model_report.pkl")
    return report