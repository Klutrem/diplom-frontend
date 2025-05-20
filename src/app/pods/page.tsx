"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";
import { useNamespace } from "@/components/namespaceContext";
import getConfig from "@/config";

// Интерфейс ответа от бэкенда
interface Pod {
  pod_name: string;
  namespace: string;
  node_name: string;
  status: string;
  start_time: string;
  cpu_usage: number;
  cpu_usage_percent: number;
  cpu_usage_limit: number;
  cpu_usage_request: number;
  memory_usage: number;
  memory_usage_percent: number;
  memory_usage_limit: number;
  memory_usage_request: number;
  restart_count: number;
}

export default function Pods() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { selectedNamespace } = useNamespace();

  useEffect(() => {
    const fetchPods = async () => {
      try {
        const response = await fetch(
          `${getConfig().backendBaseUrl}/api/pods?namespace=${selectedNamespace}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pods");
        }
        const data: Pod[] = await response.json();
        setPods(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchPods();
  }, [selectedNamespace]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (startTime: string) => {
    const start = new Date(startTime);
    const now = currentTime;
    const diffMs = now.getTime() - start.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return `${days} day${days > 1 ? "s" : ""} ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes > 1 ? "s" : ""} ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""}`;
    }
  };

  const formatUsage = (usage: number, limit: number, request: number, percent: number) => {
    const parts = [];
    if (usage > 0) parts.push(`${usage}Mi`);
    if (limit > 0) parts.push(`limit: ${limit}Mi`);
    if (request > 0) parts.push(`request: ${request}Mi`);
    if (percent > 0) parts.push(`(${percent}%)`);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const columns = [
    { key: "pod_name", header: "Pod Name" },
    { key: "status", header: "Status", render: (value: string) => (
      <span
        className={`py-1 px-3 rounded-full text-xs ${
          value === "Running"
            ? "bg-green-200 text-green-800"
            : value === "Pending"
            ? "bg-yellow-200 text-yellow-800"
            : value === "Succeeded"
            ? "bg-blue-200 text-blue-800"
            : value === "Failed"
            ? "bg-red-200 text-red-800"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {value}
      </span>
    )},
    { key: "namespace", header: "Namespace" },
    { key: "node_name", header: "Node" },
    { key: "start_time", header: "Uptime", render: (value: string) => formatUptime(value) },
    { key: "cpu_usage", header: "CPU Usage", render: (value: number, item: Pod) =>
      formatUsage(value, item.cpu_usage_limit, item.cpu_usage_request, item.cpu_usage_percent)
    },
    { key: "memory_usage", header: "Memory Usage", render: (value: number, item: Pod) =>
      formatUsage(value, item.memory_usage_limit, item.memory_usage_request, item.memory_usage_percent)
    },
    { key: "restart_count", header: "Restart Count" },
  ];

  return (
    <>
      <Head>
        <title>Pods Monitoring</title>
        <meta name="description" content="Pods monitoring dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}
      {!loading && !error && <Table title="Pods" data={pods} columns={columns} />}
    </>
  );
}