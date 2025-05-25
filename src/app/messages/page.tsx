"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Trae las conversaciones donde el usuario es sender o receiver
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender:sender_id (id, full_name), receiver:receiver_id (id, full_name), content, created_at")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        // Agrupa por usuario con el que conversa
        const grouped: any = {};
        (data || []).forEach((msg: any) => {
          const other = msg.sender.id === user.id ? msg.receiver : msg.sender;
          if (!grouped[other.id]) {
            grouped[other.id] = {
              user: other,
              last: msg.content,
              lastDate: msg.created_at,
              id: msg.id,
            };
          }
        });
        setConversations(Object.values(grouped));
      }
      setLoading(false);
    }
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-primary-700">Mensajes</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-4 h-12" />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-gray-600">Debes iniciar sesión para ver tus mensajes.</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-700">Mensajes</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-500">No tienes conversaciones aún.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((c: any) => (
            <li key={c.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-semibold text-primary-600">{c.user.full_name || c.user.id}</span>
                <p className="text-gray-700 text-sm">{c.last}</p>
                <span className="block text-xs text-gray-400 mt-1">{new Date(c.lastDate).toLocaleString()}</span>
              </div>
              <Link href={`/messages/${c.user.id}`} className="btn-secondary mt-2 md:mt-0">Ver conversación</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
} 