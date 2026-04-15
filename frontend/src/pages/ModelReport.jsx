import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function formatGameName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🔥 Model quality logic
function getModelQuality(score) {
  if (score >= 0.7) return { label: "Good Model", color: "text-green-400" };
  if (score >= 0.5) return { label: "Moderate Model", color: "text-yellow-400" };
  return { label: "Weak Model", color: "text-red-400" };
}

// 🔥 Explanation for viva
function getExplanation(score) {
  if (score >= 0.7)
    return "Clusters are well-separated, indicating strong behavioral grouping.";
  if (score >= 0.5)
    return "Clusters show moderate separation with some overlap.";
  return "Clusters are not well-separated, indicating weak grouping.";
}

function ModelReport() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/ml/model-report")
      .then((res) => setReport(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!report)
    return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white px-10 py-6">

      <Navbar />

      {/* 🔥 HEADER */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl text-green-400 font-bold mb-2">
          AI Model Evaluation
        </h1>
        <p className="text-gray-400">
          Evaluate clustering performance across different games
        </p>
      </div>

      {/* 🔥 MODELS */}
      <div className="grid md:grid-cols-2 gap-8">

        {Object.keys(report).map((game) => {
          const data = report[game];
          const quality = getModelQuality(data.silhouette_score);

          return (
            <div key={game} className="card hover:scale-105 transition">

              {/* 🔹 Title */}
              <h2 className="text-xl text-purple-400 mb-4 font-semibold">
                {formatGameName(game)} Model
              </h2>

              {/* 🔹 Metrics */}
              <div className="flex justify-between mb-4">

                <div>
                  <p className="text-gray-400 text-sm">Samples</p>
                  <h3 className="text-lg">{data.samples}</h3>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Clusters</p>
                  <h3 className="text-lg">3</h3>
                </div>

              </div>

              {/* 🔹 Silhouette Highlight */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-1">
                  Silhouette Score
                </p>

                <h3 className="text-3xl text-yellow-400 font-bold">
                  {data.silhouette_score}
                </h3>
              </div>

              {/* 🔹 Quality Badge */}
              <div className="mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 border border-gray-700 ${quality.color}`}
                >
                  {quality.label}
                </span>
              </div>

              {/* 🔹 Explanation */}
              <p className="text-gray-300 text-sm">
                {getExplanation(data.silhouette_score)}
              </p>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default ModelReport;