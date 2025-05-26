"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useNamespace } from "@/components/namespaceContext";
import { getPodMetrics, type PodMetrics } from "@/app/actions/pods";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function PodMetrics() {
  const params = useParams();
  const { selectedNamespace } = useNamespace();
  const [metrics, setMetrics] = useState<PodMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      const end = new Date();
      const start = new Date(end.getTime() - 15 * 60 * 1000); // Last 15 minutes
      
      const result = await getPodMetrics(
        selectedNamespace,
        params.pod as string,
        start.toISOString(),
        end.toISOString(),
        "15s"
      );
      
      setMetrics(result.metrics);
      setError(result.error);
      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedNamespace, params.pod]);

  const formatMemoryValue = (value: number) => {
    return (value / (1024 * 1024)).toFixed(2); // Convert to MB
  };

  const cpuData = {
    labels: metrics?.cpu_usage.map(point => new Date(point.timestamp)) || [],
    datasets: [
      {
        label: "CPU Usage",
        data: metrics?.cpu_usage.map(point => point.value) || [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const memoryData = {
    labels: metrics?.memory_usage.map(point => new Date(point.timestamp)) || [],
    datasets: [
      {
        label: "Memory Usage (MB)",
        data: metrics?.memory_usage.map(point => formatMemoryValue(point.value)) || [],
        borderColor: "rgb(153, 102, 255)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "minute" as const,
        },
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) return <div className="text-center p-4">Loading metrics...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  if (!metrics) return <div className="text-center p-4">No metrics available</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        Metrics for Pod: {params.pod}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">CPU Usage</h2>
          <Line data={cpuData} options={chartOptions} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Memory Usage</h2>
          <Line data={memoryData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 