import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (err) {
      alert("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">

      <div className="w-[380px] bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl transition-all duration-500">

        <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">
          AI Player Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-5 p-3 rounded-xl bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 rounded-xl bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-xl font-bold text-black transition-all duration-300"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <p className="text-gray-400 text-sm mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
    
  );
}

export default Login;