import React, { useState, useEffect } from "react";
import axios from "axios";

const baseSymbols = ["⚡","🔥","🌟","💎","🚀","🎯","🧠","👁","🔮","💡","🌀","🌈"];

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [difficulty] = useState(6);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => initializeGame(), []);

  useEffect(() => {
    if (startTime && !gameOver) {
      const timer = setInterval(() => {
        setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, gameOver]);

  const initializeGame = () => {
    const selected = baseSymbols.slice(0, difficulty);
    const duplicated = [...selected, ...selected];
    const shuffled = shuffleArray(duplicated).map((symbol, index) => ({
      id: index,
      symbol,
    }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setMistakes(0);
    setGameOver(false);
    setStartTime(Date.now());
  };

  const handleClick = (card) => {
    if (flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.symbol)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);

      const first = cards.find(c => c.id === newFlipped[0]);
      const second = cards.find(c => c.id === newFlipped[1]);

      if (first.symbol === second.symbol) {
        setMatched(prev => [...prev, first.symbol]);
        setFlipped([]);
      } else {
        setMistakes(prev => prev + 1);
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  useEffect(() => {
    if (matched.length === difficulty) {
      setGameOver(true);
      saveGame();
    }
  }, [matched]);

  const saveGame = async () => {
    await axios.post("http://127.0.0.1:5000/api/game/save", {
      user_id: user.user_id,
      game_type: "memory",
      moves: moves,
      mistakes: mistakes,
      time_taken: timeTaken,
      optimal_moves: difficulty
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-10">

      {/* Neon Title */}
      <h1 className="text-4xl font-bold text-cyan-400 mb-6 
                     drop-shadow-[0_0_20px_#00ffff] tracking-widest">
        MEMORY GAME
      </h1>

      {/* Stats Panel */}
      <div className="mb-6 flex gap-8 bg-gray-900 px-8 py-3 rounded-xl
                      border border-cyan-400
                      shadow-[0_0_15px_#00ffff] text-cyan-300">
        <span>Moves: {moves}</span>
        <span>Mistakes: {mistakes}</span>
        <span>Time: {timeTaken}s</span>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-6 gap-5">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.symbol);
          const isMatched = matched.includes(card.symbol);

          return (
            <div
              key={card.id}
              onClick={() => handleClick(card)}
              className={`
                w-16 h-16 flex items-center justify-center
                text-2xl font-bold rounded-xl cursor-pointer
                transition-all duration-300

                ${isFlipped
                  ? "bg-cyan-500 text-black shadow-[0_0_20px_#00ffff]"
                  : "bg-gray-800 border border-gray-600 hover:border-cyan-400 "
                }

                ${isMatched ? "shadow-[0_0_25px_#00ffff]" : ""}
              `}
            >
              {isFlipped ? card.symbol : "?"}
            </div>
          );
        })}
      </div>

      {/* Game Over Glow */}
      {gameOver && (
        <div className="mt-8 text-green-400 text-2xl font-semibold
                        drop-shadow-[0_0_20px_#22c55e]">
          🎉 Memory Mastered!
        </div>
      )}

    </div>
  );
}