import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="flex justify-between items-center mb-10">

      <h1 className="text-2xl font-bold text-purple-400">
        PlayTrack AI  
      </h1>

      <div className="flex gap-6">
        <Link to="/dashboard" className="hover:text-purple-400">
          Dashboard
        </Link>

        <Link to="/behavior" className="hover:text-purple-400">
          Behavior
        </Link>

        <Link to="/analytics" className="hover:text-purple-400">
          Analytics
        </Link>

        <Link to="/model-report" className="hover:text-purple-400">
          Model
        </Link>
      </div>

    </div>
  );
}

export default Navbar;