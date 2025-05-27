"use server";

import getConfig from "@/config";

export interface Node {
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

export async function getNodes() {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/nodes`);

    if (!response.ok) {
      throw new Error("Failed to fetch nodes");
    }

    const data: Node[] = await response.json();
    return { nodes: data, error: null };
  } catch (err) {
    return {
      nodes: [],
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
}

export type MetricPoint = {
  timestamp: string;
  value: number;
};

export type NodeMetrics = {
  cpu_usage: MetricPoint[];
  memory_usage: MetricPoint[];
};

export async function getNodeMetrics(
  nodeName: string,
  startTime: string,
  endTime: string,
  step: string
): Promise<{ metrics: NodeMetrics | null; error: string | null }> {
  try {
    const response = await fetch(
      `${getConfig().backendBaseUrl}/api/nodes/metrics/${nodeName}?start=${startTime}&end=${endTime}&step=${step}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { metrics: data, error: null };
  } catch (error) {
    console.error("Error fetching node metrics:", error);
    return { metrics: null, error: error instanceof Error ? error.message : "Failed to fetch node metrics" };
  }
} 