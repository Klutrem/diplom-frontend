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