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
  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    end: new Date(),
    step: "15s"
  });
  const [isAutoStep, setIsAutoStep] = useState(true);

  const calculateAutoStep = (start: Date, end: Date): string => {
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) return "15m";
    if (diffHours >= 6) return "5m";
    if (diffHours >= 1) return "1m";
    return "15s";
  };

  useEffect(() => {
    if (isAutoStep) {
      const autoStep = calculateAutoStep(timeRange.start, timeRange.end);
      setTimeRange(prev => ({ ...prev, step: autoStep }));
    }
  }, [timeRange.start, timeRange.end, isAutoStep]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);

      const result = await getPodMetrics(
        selectedNamespace,
        params.pod as string,
        timeRange.start.toISOString(),
        timeRange.end.toISOString(),
        timeRange.step
      );

      setMetrics(result.metrics);
      setError(result.error);
      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedNamespace, params.pod, timeRange]);

  const handleTimeRangeChange = (field: 'start' | 'end' | 'step', value: string) => {
    if (field === 'step') {
      setIsAutoStep(false);
    }
    setTimeRange(prev => ({
      ...prev,
      [field]: field === 'step' ? value : new Date(value)
    }));
  };

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
        Метрики пода: {params.pod}
      </h1>
      <div className="mb-4 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
            <input
              type="datetime-local"
              value={timeRange.start.toISOString().slice(0, 16)}
              onChange={(e) => handleTimeRangeChange('start', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Конец</label>
            <input
              type="datetime-local"
              value={timeRange.end.toISOString().slice(0, 16)}
              onChange={(e) => handleTimeRangeChange('end', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Интервал</label>
            <select
              value={timeRange.step}
              onChange={(e) => handleTimeRangeChange('step', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="15s">15 seconds</option>
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAutoStep}
                onChange={(e) => setIsAutoStep(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Автоматический интервал</span>
            </label>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Использование процессора</h2>
          <Line data={cpuData} options={chartOptions} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Использование памяти</h2>
          <Line data={memoryData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 