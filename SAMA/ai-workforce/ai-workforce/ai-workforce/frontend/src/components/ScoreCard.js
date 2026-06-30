
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ScoreChart() {
  const data = {
    labels: ["Communication", "Coding", "Problem Solving", "English", "Tools"],
    datasets: [
      {
        label: "Skill Score",
        data: [70, 85, 80, 60, 75],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"]
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      x: { type: "category" },
      y: { beginAtZero: true }
    }
  };

  return (
    <div style={{ width: "500px", margin: "auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ScoreChart;