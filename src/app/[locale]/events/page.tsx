"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Table from "@/components/table";
import { getEvents, Event } from "../actions/events";
import { getWatchedNamespaces, addWatchedNamespace, removeWatchedNamespace } from "../actions/watchedNamespaces";
import { useNamespace } from "@/components/namespaceContext";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [watchedNamespaces, setWatchedNamespaces] = useState<string[]>([]);
  const { selectedNamespace, namespaces } = useNamespace();

  useEffect(() => {
    const fetchWatchedNamespaces = async () => {
      const result = await getWatchedNamespaces();
      if (result.error) {
        console.error(result.error);
        return;
      }
      setWatchedNamespaces(result.watchedNamespaces);
    };

    fetchWatchedNamespaces();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const result = await getEvents(selectedNamespace, typeFilter || undefined);
      setEvents(result.events);
      setError(result.error);
      setLoading(false);
    };

    fetchEvents();
  }, [selectedNamespace, typeFilter]);

  const handleToggleWatchedNamespace = async (namespace: string) => {
    const isWatched = watchedNamespaces.includes(namespace);
    const action = isWatched ? removeWatchedNamespace : addWatchedNamespace;

    const result = await action(namespace);
    if (result.error) {
      console.error(result.error);
      return;
    }

    // Update local state
    setWatchedNamespaces(prev =>
      isWatched
        ? prev.filter(ns => ns !== namespace)
        : [...prev, namespace]
    );
  };

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    if (timestamp === "0001-01-01T00:00:00Z") return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU");
  };

  // Определение колонок таблицы
  const columns = [
    { key: "name" as keyof Event, header: "Имя" },
    { key: "namespace" as keyof Event, header: "Namespace" },
    { key: "reason" as keyof Event, header: "Причина" },
    { key: "message" as keyof Event, header: "Сообщение" },
    {
      key: "type" as keyof Event,
      header: "Тип",
      render: (value: string | number, item: Event) => (
        <span
          className={`py-1 px-3 rounded-full text-xs ${value === "Normal"
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
    { key: "involved_object" as keyof Event, header: "Объект" },
    {
      key: "first_timestamp" as keyof Event,
      header: "Первое время",
      render: (value: string | number, item: Event) => formatTime(value as string),
    },
    {
      key: "last_timestamp" as keyof Event,
      header: "Последнее время",
      render: (value: string | number, item: Event) => formatTime(value as string),
    },
    { key: "count" as keyof Event, header: "Количество" },
  ];

  return (
    <>
      <Head>
        <title>Мониторинг событий</title>
        <meta name="description" content="Страница мониторинга событий" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto p-4">
        <div className="mb-6 space-y-4">
          {/* Фильтр по type */}
          <div>
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

          {/* Watched Namespaces */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Отслеживаемые namespace</h3>
            <div className="flex flex-wrap gap-2">
              {namespaces.map((namespace) => (
                <button
                  key={namespace}
                  onClick={() => handleToggleWatchedNamespace(namespace)}
                  className={`px-3 py-1 rounded-full text-sm ${watchedNamespaces.includes(namespace)
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {namespace}
                </button>
              ))}
            </div>
          </div>
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