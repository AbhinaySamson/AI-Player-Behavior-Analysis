import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Behavior from "./pages/Behavior";
import Analytics from "./pages/Analytics";

import TicTacToe from "./pages/TicTacToe";
import GridPath from "./pages/GridPath";
import MemoryGame from "./pages/MemoryGame";
import TimePressure from "./pages/TimePressure";

import Register from "./pages/Register";
import ModelReport from "./pages/ModelReport";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/behavior" element={<Behavior />} />
        <Route path="/analytics" element={<Analytics />} />

        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/grid-path" element={<GridPath />} />
        <Route path="/memory-game" element={<MemoryGame />} />
        <Route path="/time-pressure" element={<TimePressure />} />

        <Route path="/register" element={<Register />} />
        <Route path="/model-report" element={<ModelReport />} />
      </Routes>
    </Router>
  );
}

export default App;