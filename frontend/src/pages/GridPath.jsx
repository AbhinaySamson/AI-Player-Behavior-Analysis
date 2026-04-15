import { useState, useEffect } from "react";
import axios from "axios";

function GridPath() {
  const size = 6;

  const difficultyLevels = {
    easy: 0.2,
    medium: 0.3,
    hard: 0.4,
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const [difficulty, setDifficulty] = useState("medium");
  const [grid, setGrid] = useState([]);
  const [humanPath, setHumanPath] = useState([[0, 0]]);
  const [aiPath, setAiPath] = useState([]);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const goal = [size - 1, size - 1];

  const generateGrid = async () => {
    const prob = difficultyLevels[difficulty];

    const res = await axios.post(
      "http://127.0.0.1:5000/api/grid/generate",
      {
        size: size,
        obstacle_prob: prob,
      }
    );

    setGrid(res.data.grid);
  };

  useEffect(() => {
    const init = async () => {
      await generateGrid();
      setHumanPath([[0, 0]]);
      setAiPath([]);
      setResult(null);
      setTimer(0);
      setIsPlaying(true);
    };
    init();
  }, [difficulty]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleClick = (r, c) => {
    if (!isPlaying) return;
    if (grid[r][c] === 1) return;

    const last = humanPath[humanPath.length - 1];
    const isAdjacent =
      Math.abs(last[0] - r) + Math.abs(last[1] - c) === 1;

    if (!isAdjacent) return;

    setHumanPath([...humanPath, [r, c]]);
  };

  const submitPath = async () => {
    setIsPlaying(false);

    try {
      const compareRes = await axios.post(
        "http://127.0.0.1:5000/api/grid/compare",
        {
          grid: grid,
          start: [0, 0],
          goal: goal,
          human_path: humanPath,
          time_taken: timer
        }
      );

      const compareData = compareRes.data;
      setResult(compareData);
      setAiPath(compareData.ai_path);

      await axios.post(
        "http://127.0.0.1:5000/api/game/save",
        {
          user_id: user.user_id,
          game_type: "grid_path",
          moves: compareData.human_steps,
          mistakes: compareData.extra_steps,
          time_taken: compareData.time_taken,
          optimal_moves: compareData.ai_steps
        }
      );

    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Something went wrong.");
    }
  };

  const resetGame = async () => {
    await generateGrid();
    setHumanPath([[0, 0]]);
    setAiPath([]);
    setResult(null);
    setTimer(0);
    setIsPlaying(true);
  };

  const renderGrid = (pathData, isHuman) => (
    <div
      className="grid gap-2 p-4 bg-gray-900 rounded-xl 
                 border border-green-500
                 shadow-[0_0_25px_#22c55e]"
      style={{ gridTemplateColumns: `repeat(${size}, 48px)` }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isPath = pathData.some(
            (p) => p[0] === r && p[1] === c
          );
          const isStart = r === 0 && c === 0;
          const isGoal = r === size - 1 && c === size - 1;

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => isHuman && handleClick(r, c)}
              className={`
                w-12 h-12 flex items-center justify-center
                text-sm font-bold rounded-md
                transition-all duration-300

                ${cell === 1
                  ? "bg-red-600 shadow-[0_0_15px_#ef4444]"
                  : "bg-gray-800 hover:bg-gray-700"
                }

                ${isPath
                  ? isHuman
                    ? "border-2 border-green-400 shadow-[0_0_20px_#22c55e]"
                    : "border-2 border-yellow-400 shadow-[0_0_20px_#eab308]"
                  : ""
                }

                ${isHuman ? "cursor-pointer hover:scale-105" : ""}
              `}
            >
              {isStart && (
                <span className="text-green-400 drop-shadow-[0_0_10px_#22c55e]">
                  S
                </span>
              )}
              {isGoal && (
                <span className="text-blue-400 drop-shadow-[0_0_10px_#3b82f6]">
                  G
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-10">

      <h1 className="text-4xl font-bold mb-6 text-green-400
                     drop-shadow-[0_0_20px_#22c55e] tracking-wider">
        GRID PATH CHALLENGE
      </h1>

      {/* Difficulty Selector */}
      <div className="flex items-center gap-4 mb-6 bg-gray-900 px-6 py-3 rounded-xl
                      border border-green-500 shadow-[0_0_15px_#22c55e]">
        <span className="text-green-300 font-semibold">Difficulty:</span>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-gray-800 text-green-300 px-4 py-2 rounded-lg
                     border border-green-500
                     focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Timer */}
      <div className="mb-6 text-lg text-green-300
                      drop-shadow-[0_0_10px_#22c55e]">
        ⏱ Time: {timer}s
      </div>

      {/* Grid Display */}
      <div className="flex gap-20 mb-8">

        <div>
          <h2 className="text-xl mb-3 text-green-400
                         drop-shadow-[0_0_10px_#22c55e]">
            Your Path
          </h2>
          {renderGrid(humanPath, true)}
        </div>

        {result && (
          <div>
            <h2 className="text-xl mb-3 text-yellow-400
                           drop-shadow-[0_0_10px_#eab308]">
              AI Optimal Path
            </h2>
            {renderGrid(aiPath, false)}
          </div>
        )}

      </div>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={submitPath}
          className="px-6 py-3 bg-green-500 hover:bg-green-600
                     rounded-lg font-semibold
                     shadow-[0_0_20px_#22c55e]
                     transition-all duration-300"
        >
          Submit Path
        </button>

        <button
          onClick={resetGame}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600
                     rounded-lg font-semibold
                     border border-green-500
                     transition-all duration-300"
        >
          New Grid
        </button>
      </div>

    </div>
  );
}

export default GridPath;