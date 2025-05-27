"use server";

import getConfig from "@/config";

export type AlertType = "all" | "warning" | "normal";

export interface TelegramAlert {
  id: number;
  chat_id: string;
  thread_id?: number;
  alert_type: AlertType;
  namespace: string;
  created_at: string;
}

export interface AlertsResponse {
  alerts: TelegramAlert[];
  total: number;
}

export interface CreateAlertData {
  bot_token: string;
  chat_id: string;
  thread_id?: number;
  alert_type: AlertType;
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