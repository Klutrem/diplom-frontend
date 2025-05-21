"use server";

import getConfig from "@/config";

export async function getNamespaces() {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/namespaces`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch namespaces");
    }
    
    const data: string[] = await response.json();
    return { namespaces: data, error: null };
  } catch (err) {
    return { 
      namespaces: [], 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
} 