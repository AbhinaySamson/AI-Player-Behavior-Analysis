import { useState, useEffect, useRef } from "react";
import axios from "axios";

function TimePressure() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [instruction, setInstruction] = useState("");
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  const [level, setLevel] = useState(1);

  const [timeLimit, setTimeLimit] = useState(7000);
  const [timer, setTimer] = useState(7000);

  const [questions, setQuestions] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);

  const [lives, setLives] = useState(3);
  const [endReason, setEndReason] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const generateQuestion = () => {
    const rand = Math.random();

    if (rand < 0.33) {
      const a = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);

      setInstruction("Select the LARGER number");
      setQuestion(`${a} vs ${b}`);
      setOptions([a, b]);
      setCorrectAnswer(a > b ? a : b);
    }

    else if (rand < 0.66) {
      const base = Math.floor(Math.random() * 5) + 2;
      const sequence = [base, base * 2, base * 4];

      setInstruction("Choose the CORRECT next number in the pattern");
      setQuestion(`${sequence[0]}, ${sequence[1]}, ${sequence[2]}, ?`);
      setOptions([base * 8, base * 6, base * 5]);
      setCorrectAnswer(base * 8);
    }

    else {
      const allColors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"];

      const word = allColors[Math.floor(Math.random() * allColors.length)];
      const actualColor = allColors[Math.floor(Math.random() * allColors.length)];

      const distractors = allColors
        .filter(c => c !== actualColor)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const finalOptions = [actualColor, ...distractors]
        .sort(() => 0.5 - Math.random());

      setInstruction("Select the FONT COLOR (not the word meaning)");
      setQuestion(word);
      setOptions(finalOptions);
      setCorrectAnswer(actualColor);
    }

    startTimeRef.current = Date.now();
    setTimer(timeLimit);
  };

  useEffect(() => {
    if (questions > 0 && questions % 3 === 0) {
      setLevel(prev => prev + 1);

      setTimeLimit(prev => {
        const newTime = prev - 500;
        return newTime >= 4000 ? newTime : 4000;
      });
    }
  }, [questions]);

  useEffect(() => {
    if (gameOver) return;

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          setEndReason("TIME_COMPLETED");
          endGame();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [timeLimit, gameOver]);

  const handleAnswer = (selected) => {

    if (gameOver) return;

    const reaction = Date.now() - startTimeRef.current;
    setReactionTimes(prev => [...prev, reaction]);
    setQuestions(prev => prev + 1);

    if (selected !== correctAnswer) {
      setMistakes(prev => prev + 1);

      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setEndReason("NO_LIVES");
          endGame();
        }
        return newLives;
      });
    }

    if (!gameOver) generateQuestion();
  };

  const endGame = async () => {

    clearInterval(intervalRef.current);
    setGameOver(true);

    if (reactionTimes.length === 0) return;

    const totalTime = reactionTimes.reduce((a, b) => a + b, 0);
    const avgRT = totalTime / reactionTimes.length;

    const variance =
      reactionTimes.reduce((a, b) =>
        a + Math.pow(b - avgRT, 2), 0
      ) / reactionTimes.length;

    const fatigueIndex =
      reactionTimes[reactionTimes.length - 1] -
      reactionTimes[0];

    const correctAnswers = questions - mistakes;

    await axios.post("http://127.0.0.1:5000/api/game/save", {
      user_id: user.user_id,
      game_type: "time_pressure",
      moves: questions,
      mistakes: mistakes,
      time_taken: Math.floor(totalTime / 1000),
      optimal_moves: correctAnswers,
      reaction_variance: variance,
      fatigue_index: fatigueIndex
    });
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const isLowTime = timer < 3000;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

      <h1 className="text-5xl mb-8 font-bold text-red-500
                     drop-shadow-[0_0_25px_#ef4444] tracking-widest">
        NEUROSPRINT
      </h1>

      {!gameOver ? (
        <>
          {/* Hearts */}
          <div className="flex gap-3 mb-6">
            {[1,2,3].map((_, index) => (
              <span
                key={index}
                className={`text-3xl transition-all duration-300 ${
                  index < lives
                    ? "text-red-500 drop-shadow-[0_0_15px_#ef4444]"
                    : "text-gray-700"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Instruction */}
          <div className="text-lg text-yellow-400 mb-3
                          drop-shadow-[0_0_10px_#facc15]">
            {instruction}
          </div>

          <div className="text-xl mb-2 text-red-300">
            Level: {level}
          </div>

          {/* Timer */}
          <div className={`text-2xl mb-6 font-bold transition-all duration-300 ${
            isLowTime
              ? "text-red-500 animate-pulse drop-shadow-[0_0_20px_#ef4444]"
              : "text-white"
          }`}>
            Time: {(timer / 1000).toFixed(1)}s
          </div>

          {/* Question */}
          <div
            className="text-4xl mb-8 font-bold"
            style={{
              color: instruction.includes("FONT COLOR")
                ? correctAnswer.toLowerCase()
                : "white"
            }}
          >
            {question}
          </div>

          {/* Options */}
          <div className="flex gap-8">
            {options.map((opt, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(opt)}
                className="px-8 py-4 bg-gray-800 rounded-xl
                           border border-red-500
                           hover:bg-red-600
                           hover:shadow-[0_0_20px_#ef4444]
                           transition-all duration-300"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center mt-10">
          {endReason === "TIME_COMPLETED" ? (
            <div className="text-green-400 text-3xl font-bold
                            drop-shadow-[0_0_20px_#22c55e]">
              🎉 Challenge Completed Successfully!
            </div>
          ) : (
            <div className="text-red-500 text-3xl font-bold
                            drop-shadow-[0_0_20px_#ef4444]">
              💀 Mistake Limit Reached!
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default TimePressure;