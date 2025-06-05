"use server";

import getConfig from "@/config";

export interface Pod {
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

export interface PodMetrics {
  cpu_usage: Array<{
    timestamp: string;
    value: number;
  }>;
  memory_usage: Array<{
    timestamp: string;
    value: number;
  }>;
}

export async function getPods(namespace: string) {
  try {
    const response = await fetch(
      `${getConfig().backendBaseUrl}/api/pods?namespace=${namespace}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch pods");
    }
    
    const data: Pod[] = await response.json();
    return { pods: data, error: null };
  } catch (err) {
    return { 
      pods: [], 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

export async function getPodMetrics(
  namespace: string,
  pod: string,
  start: string,
  end: string,
  step: string
) {
  try {
    const response = await fetch(
      `${getConfig().backendBaseUrl}/api/pods/metrics/${namespace}/${pod}?start=${start}&end=${end}&step=${step}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch pod metrics");
    }
    
    const data: PodMetrics = await response.json();
    return { metrics: data, error: null };
  } catch (err) {
    return { 
      metrics: null, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
} 