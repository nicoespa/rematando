"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { requestNotificationPermission, markNotificationAsRead } from "@/lib/notifications";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Verificar si las notificaciones push están habilitadas
        const { data: subscription } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        setPushEnabled(!!subscription);

        // Obtener notificaciones
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setNotifications(data || []);
      }
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  const handleEnablePush = async () => {
    const enabled = await requestNotificationPermission();
    setPushEnabled(enabled);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-primary-700">Notificaciones</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-4 h-10" />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-gray-600">Debes iniciar sesión para ver tus notificaciones.</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Notificaciones</h1>
        {!pushEnabled && (
          <button
            onClick={handleEnablePush}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            Activar notificaciones push
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No tienes notificaciones aún.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`bg-white rounded-lg shadow p-4 text-gray-700 ${
                n.read ? '' : 'border-l-4 border-primary-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p>{n.content}</p>
                  <span className="block text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
} 