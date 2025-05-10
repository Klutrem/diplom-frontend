"use client";
import { useEffect, useState } from "react";
import Head from "next/head";

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

export default function Home({ showSidebar = true }: { showSidebar?: boolean }) {
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

  return (
    <>
      <Head>
        <title>Nodes Monitoring</title>
        <meta name="description" content="Nodes monitoring dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`container mx-auto p-4 bg-white shadow-md rounded-lg ${showSidebar ? "ml-64" : ""}`}>
        <h1 className="text-3xl font-bold mb-6 text-center text-black">Nodes</h1>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Roles</th>
                  <th className="py-3 px-6 text-left">CPU Usage</th>
                  <th className="py-3 px-6 text-left">Memory Usage</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {nodes.map((node) => (
                  <tr
                    key={node.name}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {node.name}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${
                          node.status === "Ready"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {node.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {node.roles.join(", ")}
                    </td>
                    <td className="py-3 px-6 text-left">{`${node.cpu_usage} / ${node.cpu_capacity} (${node.cpu_usage_percentage}%)`}</td>
                    <td className="py-3 px-6 text-left">{`${node.memory_usage} / ${node.memory_capacity} (${node.memory_usage_percentage}%)`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}