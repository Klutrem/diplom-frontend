"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useNamespace } from "@/components/namespaceContext";

// Интерфейс ответа от бэкенда
interface Pod {
  pod_name: string;
  namespace: string;
  node_name: string;
  cpu_usage: number;
  cpu_usage_percent: number;
  cpu_usage_limit: number;
  cpu_usage_request: number;
  memory_usage: number;
  memory_usage_percent: number;
  memory_usage_limit: number;
  memory_usage_request: number;
}

export default function Pods() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedNamespace } = useNamespace();

  useEffect(() => {
    const fetchPods = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/pods?namespace=${selectedNamespace}`
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

  // Функция для форматирования использования ресурсов
  const formatUsage = (usage: number, limit: number, request: number, percent: number) => {
    const parts = [];
    if (usage > 0) parts.push(`${usage}Mi`);
    if (limit > 0) parts.push(`limit: ${limit}Mi`);
    if (request > 0) parts.push(`request: ${request}Mi`);
    if (percent > 0) parts.push(`(${percent}%)`);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <>
      <Head>
        <title>Pods Monitoring</title>
        <meta name="description" content="Pods monitoring dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">Pods</h1>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Pod Name</th>
                  <th className="py-3 px-6 text-left">Namespace</th>
                  <th className="py-3 px-6 text-left">Node</th>
                  <th className="py-3 px-6 text-left">CPU Usage</th>
                  <th className="py-3 px-6 text-left">Memory Usage</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {pods.map((pod) => (
                  <tr
                    key={pod.pod_name}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {pod.pod_name}
                    </td>
                    <td className="py-3 px-6 text-left">{pod.namespace}</td>
                    <td className="py-3 px-6 text-left">{pod.node_name}</td>
                    <td className="py-3 px-6 text-left">
                      {formatUsage(
                        pod.cpu_usage,
                        pod.cpu_usage_limit,
                        pod.cpu_usage_request,
                        pod.cpu_usage_percent
                      )}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {formatUsage(
                        pod.memory_usage,
                        pod.memory_usage_limit,
                        pod.memory_usage_request,
                        pod.memory_usage_percent
                      )}
                    </td>
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