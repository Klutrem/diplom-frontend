"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";
import getConfig from "@/config";

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
  const [typeFilter, setTypeFilter] = useState<string>(""); // Фильтр по type
  const selectedNamespace = "default"; // Можно заменить на динамический выбор из контекста

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Формируем query-параметры, добавляя type, только если он задан
        const queryParams = new URLSearchParams({
          namespace: selectedNamespace,
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
        setEvents(data.events);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedNamespace, typeFilter]); // Обновляем при изменении typeFilter

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    if (timestamp === "0001-01-01T00:00:00Z") return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU");
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

      <div className="container mx-auto p-4">
        {/* Фильтр по type */}
        <div className="mb-6">
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Фильтр по типу
          </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full max-w-xs p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="Normal">Normal</option>
            <option value="Warning">Warning</option>
          </select>
        </div>

        {loading && <p className="text-center">Загрузка...</p>}
        {error && <p className="text-red-500 text-center">Ошибка: {error}</p>}
        {!loading && !error && (
          <Table title="Events" data={events} columns={columns} />
        )}
      </div>
    </>
  );
}