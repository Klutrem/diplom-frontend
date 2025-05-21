"use server";

import getConfig from "@/config";

export interface Event {
  id: string;
  namespace: string;
  name: string;
  reason: string;
  message: string;
  type: string;
  involved_object: string;
  first_timestamp: string;
  last_timestamp: string;
  count: number;
}

export async function getEvents(namespace: string, typeFilter?: string) {
  try {
    const queryParams = new URLSearchParams({
      namespace,
      limit: "100",
    });
    
    if (typeFilter) {
      queryParams.append("type", typeFilter);
    }

    const response = await fetch(`${getConfig().backendBaseUrl}/api/events?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error("Не удалось загрузить события");
    }
    
    const data = await response.json();
    return { events: data.events, error: null };
  } catch (err) {
    return { 
      events: [], 
      error: err instanceof Error ? err.message : "Неизвестная ошибка" 
    };
  }
} 