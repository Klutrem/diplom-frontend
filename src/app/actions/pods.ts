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