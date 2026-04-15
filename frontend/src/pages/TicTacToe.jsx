import { useState } from "react";
import axios from "axios";

function TicTacToe() {
  const human = "X";
  const ai = "O";

  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const winningLines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const checkWinner = (b) => {
    for (let [a,b1,c] of winningLines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (!b.includes(null)) return "Draw";
    return null;
  };

  const minimax = (newBoard, isMax) => {
    const result = checkWinner(newBoard);
    if (result === ai) return 1;
    if (result === human) return -1;
    if (result === "Draw") return 0;

    if (isMax) {
      let best = -Infinity;
      newBoard.forEach((cell, i) => {
        if (!cell) {
          newBoard[i] = ai;
          best = Math.max(best, minimax(newBoard, false));
          newBoard[i] = null;
        }
      });
      return best;
    } else {
      let best = Infinity;
      newBoard.forEach((cell, i) => {
        if (!cell) {
          newBoard[i] = human;
          best = Math.min(best, minimax(newBoard, true));
          newBoard[i] = null;
        }
      });
      return best;
    }
  };

  const bestMove = (boardState) => {
    let bestScore = -Infinity;
    let move;
    boardState.forEach((cell, i) => {
      if (!cell) {
        boardState[i] = ai;
        let score = minimax(boardState, false);
        boardState[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    });
    return move;
  };

  const submitGame = async (finalMoves) => {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    await axios.post("http://127.0.0.1:5000/api/game/save", {
      user_id: user.user_id,
      game_type: "tic_tac_toe",
      moves: finalMoves,
      mistakes: 0,
      time_taken: timeTaken,
      optimal_moves: 5
    });
  };

  const handleClick = async (index) => {
    if (board[index] || winner || isSubmitting) return;

    let newBoard = [...board];
    newBoard[index] = human;
    let newMoves = moves + 1;
    setMoves(newMoves);

    let result = checkWinner(newBoard);
    if (result) {
      setBoard(newBoard);
      setWinner(result);
      await submitGame(newMoves);
      return;
    }

    const aiMove = bestMove(newBoard);
    newBoard[aiMove] = ai;
    newMoves += 1;
    setMoves(newMoves);

    result = checkWinner(newBoard);
    setBoard(newBoard);

    if (result) {
      setWinner(result);
      await submitGame(newMoves);
    }
  };

  const resetGame = () => window.location.reload();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">

      <h2 className="text-5xl font-bold mb-10 text-blue-400 
                     drop-shadow-[0_0_20px_#3b82f6] tracking-widest">
        TIC TAC TOE
      </h2>

      {/* Neon Board */}
      <div className="grid grid-cols-3 gap-3 p-5 
                      bg-gray-900 rounded-2xl
                      border border-blue-500
                      shadow-[0_0_25px_#3b82f6]">

        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-28 h-28 flex items-center justify-center
                       bg-gray-800 text-4xl font-bold rounded-xl
                       border border-gray-600
                       transition-all duration-300
                       hover:border-blue-400
                       hover:shadow-[0_0_20px_#3b82f6]
                       hover:scale-105"
          >
            <span
              className={`${
                cell === "X"
                  ? "text-blue-400 drop-shadow-[0_0_20px_#3b82f6]"
                  : cell === "O"
                  ? "text-red-400 drop-shadow-[0_0_20px_#f87171]"
                  : ""
              }`}
            >
              {cell}
            </span>
          </button>
        ))}

      </div>

      {/* Winner Section */}
      {winner && (
        <div className="mt-10 text-center animate-pulse">
          <p className="text-3xl font-bold mb-6
                        text-green-400
                        drop-shadow-[0_0_20px_#22c55e]">
            {winner === "Draw" ? "It's a Draw!" : `Winner: ${winner}`}
          </p>

          <button
            onClick={resetGame}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 
                       rounded-xl text-lg font-bold
                       shadow-[0_0_20px_#3b82f6]
                       transition-all duration-300"
          >
            Play Again
          </button>
        </div>
      )}

    </div>
  );
}

export default TicTacToe;