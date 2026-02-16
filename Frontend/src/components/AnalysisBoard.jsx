import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import "./AnalysisBoard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalysisBoard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    avgOrder: 0,
    topProducts: [],
    categorySales: [],
    orderTrends: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/analysis");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching analysis:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="analysis-board">
      <h2 className="analysis-title">📊 Analysis Dashboard</h2>

      {/* Revenue Cards */}
      <div className="analysis-cards">
        <div className="card blue-card">
          <div>
            <h3>₹{stats.revenue}</h3>
            <p>Total Revenue</p>
          </div>
          <DollarSign size={36} />
        </div>

        <div className="card green-card">
          <div>
            <h3>{stats.orders}</h3>
            <p>Total Orders</p>
          </div>
          <ShoppingCart size={36} />
        </div>

        <div className="card orange-card">
          <div>
            <h3>₹{stats.avgOrder}</h3>
            <p>Avg Order Value</p>
          </div>
          <TrendingUp size={36} />
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-box">
          <h4>Top Selling Products</h4>
          <Bar
            data={{
              labels: stats.topProducts.map((p) => p.name),
              datasets: [
                {
                  label: "Units Sold",
                  data: stats.topProducts.map((p) => p.sales),
                  backgroundColor: "rgba(37, 99, 235, 0.8)",
                },
              ],
            }}
          />
        </div>

        <div className="chart-box">
          <h4>Category Sales</h4>
          <Pie
            data={{
              labels: stats.categorySales.map((c) => c.category),
              datasets: [
                {
                  data: stats.categorySales.map((c) => c.sales),
                  backgroundColor: [
                    "#2563eb",
                    "#dc2626",
                    "#16a34a",
                    "#f59e0b",
                    "#9333ea",
                    "#06b6d4",
                    "#e11d48",
                  ],
                },
              ],
            }}
          />
        </div>

        <div className="chart-box">
          <h4>Order Trends</h4>
          <Line
  data={{
    labels: stats.orderTrends.map((o) => o._id), // ✅ fix here
    datasets: [
      {
        label: "Orders",
        data: stats.orderTrends.map((o) => o.count),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }}
/>

        </div>
      </div>
    </div>
  );
}
