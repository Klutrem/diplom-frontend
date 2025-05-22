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

export default function AlertsPage() {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [alerts, setAlerts] = useState<TelegramAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    botToken: "",
    chatId: "",
    threadId: "",
    alertType: "info" as AlertType,
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
      threadId: formData.threadId ? parseInt(formData.threadId) : undefined,
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
      botToken: "",
      chatId: "",
      threadId: "",
      alertType: "info",
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
      <h1 className="text-3xl font-bold mb-8">Telegram Alerts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Create New Alert</CardTitle>
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
                    <SelectValue placeholder="Select namespace" className="text-sm text-gray-500" />
                  </SelectTrigger>
                  <SelectContent>
                    {namespaces.map((ns, index) => (
                      <SelectItem className="text-sm text-gray-500" key={`namespace-${index}`} value={ns || `default-${index}`}>
                        {ns}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="botToken" className="text-sm text-gray-500">Bot Token</Label>
                <Input
                  id="botToken"
                  value={formData.botToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, botToken: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chatId" className="text-sm text-gray-500">Chat ID</Label>
                <Input
                  id="chatId"
                  value={formData.chatId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, chatId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threadId" className="text-sm text-gray-500">Thread ID (Optional)</Label>
                <Input
                  id="threadId"
                  type="number"
                  value={formData.threadId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, threadId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertType" className="text-sm text-gray-500">Alert Type</Label>
                <Select
                  value={formData.alertType}
                  onValueChange={(value: AlertType) => setFormData({ ...formData, alertType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" className="text-sm text-gray-500" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info" className="text-sm text-green-500">Info</SelectItem>
                    <SelectItem value="warning" className="text-sm text-orange-500">Warning</SelectItem>
                    <SelectItem value="error" className="text-sm text-red-500">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">
                Create Alert
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
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
                      <p className="font-medium">Chat ID: {alert.chatId}</p>
                      <p className="text-sm text-gray-500">
                        Type: {alert.alertType}
                        {alert.threadId && ` • Thread: ${alert.threadId}`}
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