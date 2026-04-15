import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
  ResponsiveContainer,
  Legend
} from "recharts";

function AnalyticsCharts({ data }) {

  if (!data) return null;

  const ob = data.overall_behavior || {};

  const normalize = (value, max = 100) => {
    if (!value) return 0;
    return Math.min((value / max) * 100, 100);
  };

  const xpData = data.xp_timeline?.map((xp, index) => ({
    game: index + 1,
    xp: xp
  })) || [];

  const comparisonData = data.human_vs_ai || [];

  const reactionData = data.reaction_times?.map((rt, index) => ({
    game: index + 1,
    reaction: rt
  })) || [];

  const radarData = [
    { metric: "Accuracy", value: normalize(ob.accuracy) },
    { metric: "Efficiency", value: normalize(ob.efficiency) },
    { metric: "Speed", value: normalize(ob.decision_speed, 10) },
    { metric: "Consistency", value: 100 - normalize(ob.mistake_rate) },
    { metric: "Stress Resistance", value: 100 - normalize(ob.fatigue_index, 3000) }
  ];

  return (
    <div className="space-y-24 mt-20">
      {/* XP GROWTH  */}
      <div>
        <h2 className="text-2xl mb-6 text-center text-green-400">
          XP Growth Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={xpData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="game" stroke="#aaa" label={{ value: "Game Number", position: "insideBottom", fill: "#aaa" }} />
            <YAxis stroke="#aaa" label={{ value: "XP", angle: -90, position: "insideLeft", fill: "#aaa" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#22c55e"
              strokeWidth={3}
              name="XP"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* EFFICIENCY EVOLUTION */}
<div>
  <h2 className="text-2xl mb-6 text-center text-blue-400">
    Efficiency Evolution & Prediction
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart
      data={[
        ...data.efficiency_timeline?.map((val, index) => ({
          game: index + 1,
          efficiency: val,
          predicted: null
        })),
        ...data.predicted_efficiency?.map((val, index) => ({
          game: data.efficiency_timeline.length + index + 1,
          efficiency: null,
          predicted: val
        }))
      ]}
    >
      <CartesianGrid stroke="#444" />
      <XAxis
        dataKey="game"
        stroke="#aaa"
        label={{
          value: "Game Number",
          position: "insideBottom",
          fill: "#aaa"
        }}
      />
      <YAxis
        stroke="#aaa"
        label={{
          value: "Efficiency %",
          angle: -90,
          position: "insideLeft",
          fill: "#aaa"
        }}
      />
      <Tooltip />
      <Legend />

      <Line
        type="monotone"
        dataKey="efficiency"
        stroke="#3b82f6"
        strokeWidth={3}
        name="Actual Efficiency"
      />

      <Line
        type="monotone"
        dataKey="predicted"
        stroke="#a855f7"
        strokeWidth={3}
        strokeDasharray="5 5"
        name="Predicted Efficiency"
      />
    </LineChart>
  </ResponsiveContainer>
</div>

      {/* REACTION TIME*/}
      <div>
        <h2 className="text-2xl mb-6 text-center text-yellow-400">
          Reaction Time Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reactionData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="game" stroke="#aaa" label={{ value: "Game Number", position: "insideBottom", fill: "#aaa" }} />
            <YAxis stroke="#aaa" label={{ value: "Time (seconds)", angle: -90, position: "insideLeft", fill: "#aaa" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="reaction"
              stroke="#facc15"
              strokeWidth={3}
              name="Reaction Time"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RADAR PROFILE */}
      <div>
        <h2 className="text-2xl mb-6 text-center text-purple-400">
          Behavioral Intelligence Profile
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart outerRadius={130} data={radarData}>
            <PolarGrid stroke="#555" />
            <PolarAngleAxis dataKey="metric" stroke="#fff" />
            <PolarRadiusAxis stroke="#888" />
            <Radar
              name="Behavior Metrics"
              dataKey="value"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default AnalyticsCharts;