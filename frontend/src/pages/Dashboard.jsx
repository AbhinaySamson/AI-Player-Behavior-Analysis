import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

// 🔥 Format game name
function formatGameName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🔥 Best Game
function getBestGame(perGames) {
  if (!perGames || perGames.length === 0) return null;

  return perGames.reduce((prev, curr) =>
    curr.avg_efficiency > prev.avg_efficiency ? curr : prev
  );
}

// 🔥 Weak Game
function getWeakGame(perGames) {
  if (!perGames || perGames.length === 0) return null;

  return perGames.reduce((prev, curr) =>
    curr.avg_efficiency < prev.avg_efficiency ? curr : prev
  );
}

// 🔥 Insight Generator
function generateInsight(game) {
  const acc = game.avg_accuracy;
  const eff = game.avg_efficiency;

  if (eff > 80 && acc > 80) {
    return "You perform very strongly with high efficiency and accuracy.";
  } else if (eff > 70) {
    return "You show good strategic planning with decent efficiency.";
  } else if (acc > 70) {
    return "Your decisions are accurate but can be optimized further.";
  } else {
    return "Performance is inconsistent — improvement needed in this area.";
  }
}

function Dashboard() {
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

  const bestGame = getBestGame(data.per_game);
  const weakGame = getWeakGame(data.per_game);

  return (
    <div className="min-h-screen bg-black text-white px-10 py-6">

      <Navbar />

      {/* 🔥 HEADER */}
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">
          Track your performance, behavior, and improvement insights
        </p>
      </div>

      {/* 🔥 TOP CARDS */}
      <div className="grid md:grid-cols-5 gap-6 mb-14">

        <div className="card hover:scale-105 transition">
          <p className="text-gray-400">XP</p>
          <h2 className="text-2xl text-blue-400">{data.xp}</h2>
        </div>

        <div className="card hover:scale-105 transition">
          <p className="text-gray-400">Level</p>
          <h2 className="text-2xl text-purple-400">{data.level}</h2>
        </div>

        <div className="card hover:scale-105 transition">
          <p className="text-gray-400">Total Games</p>
          <h2 className="text-2xl">{data.per_game.length}</h2>
        </div>

        <div className="card hover:scale-105 transition">
          <p className="text-gray-400">Best Game</p>
          <h2 className="text-green-400 text-lg font-semibold">
            {bestGame ? formatGameName(bestGame.game_type) : "N/A"}
          </h2>
        </div>

        <div className="card hover:scale-105 transition">
          <p className="text-gray-400">Needs Improvement</p>
          <h2 className="text-red-400 text-lg font-semibold">
            {weakGame ? formatGameName(weakGame.game_type) : "N/A"}
          </h2>
        </div>

      </div>

      {/* 🔥 BEHAVIOR INSIGHTS */}
      <div className="mb-14">

        <h2 className="text-2xl text-purple-400 mb-6">
          Behavior Insights
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          {data.per_game.map((g) => (
            <div
              key={g.game_type}
              className="bg-gray-900 border border-gray-700 rounded-xl p-5 
              hover:border-purple-500 transition"
            >

              <h3 className="text-lg text-blue-400 font-semibold mb-2">
                {formatGameName(g.game_type)}
              </h3>

              <p className="text-gray-300 mb-3">
                {generateInsight(g)}
              </p>

              <div className="flex gap-6 text-sm text-gray-400">
                <span>
                  Accuracy:{" "}
                  <span className="text-green-400">
                    {g.avg_accuracy}%
                  </span>
                </span>

                <span>
                  Efficiency:{" "}
                  <span className="text-yellow-400">
                    {g.avg_efficiency}%
                  </span>
                </span>
              </div>

            </div>
          ))}

        </div>

      </div>

      {/* 🔥 PLAY GAMES */}
      <div>

        <h2 className="text-2xl text-purple-400 mb-6">
          Play Games
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          <a
            href="/tic-tac-toe"
            className="card text-center hover:scale-105 hover:border-purple-500 transition"
          >
            <h3 className="text-xl mb-2">🎮 Tic Tac Toe</h3>
            <p className="text-gray-400 text-sm">Strategy & Planning</p>
            <p className="text-purple-400 text-xs mt-2">Click to Play →</p>
          </a>

          <a
            href="/grid-path"
            className="card text-center hover:scale-105 hover:border-purple-500 transition"
          >
            <h3 className="text-xl mb-2">🧭 Grid Path</h3>
            <p className="text-gray-400 text-sm">Path Optimization</p>
            <p className="text-purple-400 text-xs mt-2">Click to Play →</p>
          </a>

          <a
            href="/memory-game"
            className="card text-center hover:scale-105 hover:border-purple-500 transition"
          >
            <h3 className="text-xl mb-2">🧠 Memory</h3>
            <p className="text-gray-400 text-sm">Memory & Recall</p>
            <p className="text-purple-400 text-xs mt-2">Click to Play →</p>
          </a>

          <a
            href="/time-pressure"
            className="card text-center hover:scale-105 hover:border-purple-500 transition"
          >
            <h3 className="text-xl mb-2">⚡ NeuroSprint</h3>
            <p className="text-gray-400 text-sm">Reaction & Speed</p>
            <p className="text-purple-400 text-xs mt-2">Click to Play →</p>
          </a>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;