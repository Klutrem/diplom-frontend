"use server";

import getConfig from "@/config";

interface WatchedNamespacesResponse {
  namespaces: string[];
  total: number;
}

export async function getWatchedNamespaces() {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/watched_namespaces`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch watched namespaces");
    }
    
    const data: WatchedNamespacesResponse = await response.json();
    return { watchedNamespaces: data.namespaces, error: null };
  } catch (err) {
    return { 
      watchedNamespaces: [], 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

export async function addWatchedNamespace(namespace: string) {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/watched_namespaces?namespace=${namespace}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to add watched namespace");
    }
    
    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

export async function removeWatchedNamespace(namespace: string) {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/watched_namespaces/${namespace}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error("Failed to remove watched namespace");
    }
    
    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
} 