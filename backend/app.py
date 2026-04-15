from flask import Flask
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.game_routes import game_bp
from routes.analytics_routes import analytics_bp
from routes.ml_routes import ml_bp
from routes.grid_routes import grid_bp

app = Flask(__name__)
CORS(app)


app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(game_bp, url_prefix="/api/game")
app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
app.register_blueprint(ml_bp, url_prefix="/api/ml")
app.register_blueprint(grid_bp, url_prefix="/api/grid")


@app.route("/")
def home():
    return {"message": "AI Player Behavior Backend Running 🚀"}


if __name__ == "__main__":
    app.run(debug=True)