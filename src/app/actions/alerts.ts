"use server";

import getConfig from "@/config";

export type AlertType = "error" | "warning" | "info";

export interface TelegramAlert {
  id: number;
  chatId: string;
  threadId?: number;
  alertType: AlertType;
  namespace: string;
  createdAt: string;
}

export interface AlertsResponse {
  alerts: TelegramAlert[];
  total: number;
}

export interface CreateAlertData {
  botToken: string;
  chatId: string;
  threadId?: number;
  alertType: AlertType;
  namespace: string;
}

export async function getAlertsByNamespace(namespace: string) {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/alerts/namespace/${namespace}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }
    
    const data: AlertsResponse = await response.json();
    return { alerts: data.alerts || [], error: null };
  } catch (err) {
    return { 
      alerts: [], 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

export async function createAlert(data: CreateAlertData) {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create alert");
    }
    
    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

export async function deleteAlert(id: number) {
  try {
    const response = await fetch(`${getConfig().backendBaseUrl}/api/alerts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete alert");
    }
    
    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
} 