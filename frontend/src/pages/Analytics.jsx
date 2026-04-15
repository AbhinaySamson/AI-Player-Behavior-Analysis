import AnalyticsCharts from "../components/AnalyticsCharts";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Analytics() {
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
    <div className="min-h-screen bg-black text-white p-10">
      <Navbar />
      <h1 className="text-4xl mb-10 text-purple-400">
        Game Analytics
      </h1>

      <AnalyticsCharts data={data} />
    </div>
  );
}

export default Analytics;