"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";
import { getNodes, Node } from "./[locale]/actions/nodes";
import Link from "next/link";

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      const result = await getNodes();
      setNodes(result.nodes);
      setError(result.error);
      setLoading(false);
    };

    fetchNodes();
  }, []);

  const columns = [
    {
      key: "name" as keyof Node,
      header: "Name",
      render: (value: string | string[], item: Node) => (
        <Link
          href={`/nodes/${value}/metrics`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value}
        </Link>
      )
    },
    {
      key: "status" as keyof Node,
      header: "Status",
      render: (value: string | string[], item: Node) => (
        <span
          className={`py-1 px-3 rounded-full text-xs ${value === "Ready" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            }`}
        >
          {value}
        </span>
      )
    },
    {
      key: "roles" as keyof Node,
      header: "Roles",
      render: (value: string | string[], item: Node) => (value as string[]).join(", ")
    },
    {
      key: "cpu_usage" as keyof Node,
      header: "CPU Usage",
      render: (value: string | string[], item: Node) => (
        `${value} / ${item.cpu_capacity} (${item.cpu_usage_percentage}%)`
      )
    },
    {
      key: "memory_usage" as keyof Node,
      header: "Memory Usage",
      render: (value: string | string[], item: Node) => (
        `${value} / ${item.memory_capacity} (${item.memory_usage_percentage}%)`
      )
    },
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