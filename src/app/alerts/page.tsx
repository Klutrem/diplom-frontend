"use client";

import { useState, useEffect } from "react";
import { getWatchedNamespaces } from "../actions/watchedNamespaces";
import { getAlertsByNamespace, createAlert, deleteAlert, type TelegramAlert, type AlertType } from "../actions/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [alerts, setAlerts] = useState<TelegramAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bot_token: "",
    chat_id: "",
    thread_id: "",
    alert_type: "info" as AlertType,
  });

  useEffect(() => {
    const fetchNamespaces = async () => {
      const { watchedNamespaces, error } = await getWatchedNamespaces();
      if (error) {
        setError(error);
        return;
      }
      setNamespaces(watchedNamespaces);
      if (watchedNamespaces.length > 0) {
        setSelectedNamespace(watchedNamespaces[0]);
      }
    };

    fetchNamespaces();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!selectedNamespace) return;
      const { alerts, error } = await getAlertsByNamespace(selectedNamespace);
      if (error) {
        setError(error);
        return;
      }
      setAlerts(alerts);
    };

    fetchAlerts();
  }, [selectedNamespace]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { error } = await createAlert({
      ...formData,
      thread_id: formData.thread_id ? parseInt(formData.thread_id) : undefined,
      namespace: selectedNamespace,
    });

    if (error) {
      setError(error);
      return;
    }

    // Refresh alerts
    const { alerts } = await getAlertsByNamespace(selectedNamespace);
    setAlerts(alerts);

    // Reset form
    setFormData({
      bot_token: "",
      chat_id: "",
      thread_id: "",
      alert_type: "normal",
    });
  };

  const handleDelete = async (id: number) => {
    const { error } = await deleteAlert(id);
    if (error) {
      setError(error);
      return;
    }

    // Refresh alerts
    const { alerts } = await getAlertsByNamespace(selectedNamespace);
    setAlerts(alerts);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Алерты в Telegram</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Создать новое оповещение</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namespace" className="text-sm text-gray-500">Namespace</Label>
                <Select
                  value={selectedNamespace}
                  onValueChange={setSelectedNamespace}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select namespace" className="text-sm text-gray-900" />
                  </SelectTrigger>
                  <SelectContent>
                    {namespaces.map((ns, index) => (
                      <SelectItem className="text-sm text-gray-900" key={`namespace-${index}`} value={ns || `default-${index}`}>
                        {ns}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="botToken" className="text-sm text-gray-500">Токен бота</Label>
                <Input
                  id="botToken"
                  value={formData.bot_token}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, bot_token: e.target.value })}
                  required
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chatId" className="text-sm text-gray-500">ID чата</Label>
                <Input
                  id="chatId"
                  value={formData.chat_id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, chat_id: e.target.value })}
                  required
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threadId" className="text-sm text-gray-500">ID потока (необязательно)</Label>
                <Input
                  id="threadId"
                  type="number"
                  value={formData.thread_id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thread_id: e.target.value })}
                  className="text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertType" className="text-sm text-gray-500">Тип оповещения</Label>
                <Select
                  value={formData.alert_type}
                  onValueChange={(value: AlertType) => setFormData({ ...formData, alert_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Выберите тип оповещения"
                      className={cn(
                        "text-sm",
                        formData.alert_type === "normal" && "text-green-500",
                        formData.alert_type === "warning" && "text-orange-500",
                        formData.alert_type === "all" && "text-blue-500"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal" className="text-sm text-green-500">Обычный</SelectItem>
                    <SelectItem value="warning" className="text-sm text-orange-500">Предупреждение</SelectItem>
                    <SelectItem value="all" className="text-sm text-blue-500">Все</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">
                Создать оповещение
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Активные оповещения</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">ID чата: {alert.chat_id}</p>
                      <p className="text-sm text-gray-500">
                        Тип: {alert.alert_type}
                        {alert.thread_id && ` • ID потока: ${alert.thread_id}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {alerts.length === 0 && (
                <p className="text-center text-gray-500">No alerts found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 