"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";

// Интерфейс ответа от бэкенда
interface Node {
  name: string;
  status: string;
  roles: string[];
  cpu_usage: string;
  cpu_capacity: string;
  cpu_usage_percentage: string;
  memory_usage: string;
  memory_usage_percentage: string;
  memory_capacity: string;
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/nodes");
        if (!response.ok) {
          throw new Error("Failed to fetch nodes");
        }
        const data: Node[] = await response.json();
        setNodes(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const columns = [
    { key: "name", header: "Name" },
    { key: "status", header: "Status", render: (value: string) => (
      <span
        className={`py-1 px-3 rounded-full text-xs ${
          value === "Ready" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
        }`}
      >
        {value}
      </span>
    )},
    { key: "roles", header: "Roles", render: (value: string[]) => value.join(", ") },
    { key: "cpu_usage", header: "CPU Usage", render: (value: string, item: Node) => (
      `${value} / ${item.cpu_capacity} (${item.cpu_usage_percentage}%)`
    )},
    { key: "memory_usage", header: "Memory Usage", render: (value: string, item: Node) => (
      `${value} / ${item.memory_capacity} (${item.memory_usage_percentage}%)`
    )},
  ];

  return (
    <>
      <Head>
        <title>Nodes Monitoring</title>
        <meta name="description" content="Nodes monitoring dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}
      {!loading && !error && <Table title="Nodes" data={nodes} columns={columns} />}
    </>
  );
}