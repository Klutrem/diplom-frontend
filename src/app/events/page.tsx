"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";

// Интерфейс события из API
interface Event {
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

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const selectedNamespace = "default"; // Можно заменить на динамический выбор из контекста

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/events?namespace=${selectedNamespace}&limit=10`
        );
        if (!response.ok) {
          throw new Error("Не удалось загрузить события");
        }
        const data = await response.json();
        setEvents(data.events); // Берем массив событий из ответа
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedNamespace]);

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    if (timestamp === "0001-01-01T00:00:00Z") return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU"); // Локализация для читаемого формата
  };

  // Определение колонок таблицы
  const columns = [
    { key: "name", header: "Имя" },
    { key: "namespace", header: "Namespace" },
    { key: "reason", header: "Причина" },
    { key: "message", header: "Сообщение" },
    {
      key: "type",
      header: "Тип",
      render: (value: string) => (
        <span
          className={`py-1 px-3 rounded-full text-xs ${
            value === "Normal"
              ? "bg-green-200 text-green-800"
              : value === "Warning"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: "involved_object", header: "Объект" },
    {
      key: "first_timestamp",
      header: "Первое время",
      render: (value: string) => formatTime(value),
    },
    {
      key: "last_timestamp",
      header: "Последнее время",
      render: (value: string) => formatTime(value),
    },
    { key: "count", header: "Количество" },
  ];

  return (
    <>
      <Head>
        <title>Мониторинг событий</title>
        <meta name="description" content="Страница мониторинга событий" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading && <p className="text-center">Загрузка...</p>}
      {error && <p className="text-red-500 text-center">Ошибка: {error}</p>}
      {!loading && !error && (
        <Table title="События" data={events} columns={columns}/>
      )}
    </>
  );
}