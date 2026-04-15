import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

// 🔥 Format game name
function formatGameName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🔥 Behavior color
function getBehaviorColor(behavior) {
  if (!behavior) return "text-gray-400";

  if (behavior.includes("Strategic")) return "text-green-400";
  if (behavior.includes("Balanced")) return "text-blue-400";
  if (behavior.includes("Inconsistent")) return "text-red-400";

  return "text-purple-400";
}

// 🔥 Progress Bar Width
function getWidth(value) {
  return `${Math.min(value, 100)}%`;
}

function Behavior() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/analytics/user/${user.user_id}`
      );
      setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white px-10 py-6">

      <Navbar />

      {/* 🔥 HEADER */}
      <div className="mb-10">
        <h1 className="text-5xl text-purple-400 font-bold mb-2">
          AI Behavioral Intelligence
        </h1>
        <p className="text-gray-400">
          Analyze your gameplay patterns and decision-making behavior
        </p>
      </div>

      {/* 🔥 GAME CARDS */}
      <div className="grid md:grid-cols-2 gap-6">

        {data.per_game.map((game) => (
          <div
            key={game.game_type}
            className="card hover:scale-105 transition duration-300"
          >

            {/* 🔹 Game Title */}
            <h2 className="text-xl text-blue-400 font-semibold mb-3">
              {formatGameName(game.game_type)}
            </h2>

            {/* 🔹 Metrics */}
            <div className="flex gap-6 text-sm text-gray-400 mb-4">
              <span>
                Accuracy:{" "}
                <span className="text-green-400 font-medium">
                  {game.avg_accuracy}%
                </span>
              </span>

              <span>
                Efficiency:{" "}
                <span className="text-yellow-400 font-medium">
                  {game.avg_efficiency}%
                </span>
              </span>
            </div>

            {/* 🔹 Behavior Badge */}
            <div className="mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 border border-gray-700 ${getBehaviorColor(
                  game.behavior
                )}`}
              >
                {game.behavior}
              </span>
            </div>

            {/* 🔹 Explanation */}
            <p className="text-gray-300 text-sm mb-4">
              {game.explanation}
            </p>

            {/* 🔹 Confidence Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Confidence</span>
                <span className="text-purple-400 font-medium">
                  {game.confidence}%
                </span>
              </div>

              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: getWidth(game.confidence) }}
                ></div>
              </div>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Behavior;