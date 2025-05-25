"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { Star, Clock, DollarSign, Heart, Settings, LogOut, Bell, MessageSquare } from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("active");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user, profile, auctions, bids, favorites
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (!authUser) return setLoading(false);
      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setProfile(profileData);
      // Auctions
      const { data: auctionsData } = await supabase
        .from("auctions")
        .select("*, bids (id)")
        .eq("user_id", authUser.id);
      setAuctions(auctionsData || []);
      // Bids
      const { data: bidsData } = await supabase
        .from("bids")
        .select("*, auction:auction_id (id, title, image_url, end_time, current_price)")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });
      setBids(bidsData || []);
      // Favorites
      const { data: favData } = await supabase
        .from("favorites")
        .select("*, auction:auction_id (id, title, image_url, end_time, current_price)")
        .eq("user_id", authUser.id);
      setFavorites(favData || []);
      // Notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });
      setNotifications(notifData || []);
      // Messages
      const { data: msgData } = await supabase
        .from("messages")
        .select("*, auction:auction_id (id, title)")
        .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
        .order("created_at", { ascending: false });
      setMessages(msgData || []);
      setLoading(false);
    }
    fetchData();
    // Realtime
    const channel = supabase.channel('profile-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 text-lg">Cargando perfil...</p></div>;
  }
  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 text-lg">Debes iniciar sesión para ver tu perfil.</p></div>;
  }

  const activeAuctions = auctions.filter(a => a.status === "active");
  const draftAuctions = auctions.filter(a => a.status === "draft");

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header del perfil */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url || "/avatar-placeholder.png"}
                alt={profile.full_name || user.email}
                fill
                className="object-cover"
                quality={90}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || user.email}</h1>
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Star className="w-5 h-5 fill-current" />
                <span>{profile.rating || 5}</span>
              </div>
              <p className="text-gray-600">Miembro desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</p>
            </div>
          </div>
        </div>
        {/* Tabs y contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === "active" ? "bg-[#7a2c1b] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  Subastas activas
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === "history" ? "bg-[#7a2c1b] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  Historial de pujas
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === "favorites" ? "bg-[#7a2c1b] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  Favoritos
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === "settings" ? "bg-[#7a2c1b] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Configuración
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === "notifications" ? "bg-[#7a2c1b] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notificaciones
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === "messages" ? "bg-[#7a2c1b] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Mensajes
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                  onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </nav>
            </div>
          </div>
          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {activeTab === "active" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Mis subastas activas</h2>
                  <Link
                    href="/create-auction"
                    className="bg-[#7a2c1b] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a9442a] transition"
                  >
                    Nueva subasta
                  </Link>
                </div>
                {/* Subastas activas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeAuctions.map((auction) => (
                    <div key={auction.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={auction.image_url || "/placeholder.jpg"}
                          alt={auction.title}
                          fill
                          className="object-cover"
                          quality={90}
                        />
                        <div className="absolute top-2 right-2 bg-[#7a2c1b] text-white px-3 py-1 rounded-full text-sm">
                          {auction.bids.length} pujas
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{auction.title}</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Precio actual</p>
                            <p className="text-xl font-bold text-[#7a2c1b]">${auction.current_price?.toLocaleString?.() ?? "-"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Termina en</p>
                            <p className="text-sm font-semibold text-[#7a2c1b]">
                              {auction.end_time ? Math.ceil((new Date(auction.end_time).getTime() - Date.now()) / (1000 * 60 * 60)) : "-"} horas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Borradores */}
                {draftAuctions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Borradores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {draftAuctions.map((auction) => (
                        <div key={auction.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                          <div className="relative h-48">
                            <Image
                              src={auction.image_url || "/placeholder.jpg"}
                              alt={auction.title}
                              fill
                              className="object-cover"
                              quality={90}
                            />
                            <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                              Borrador
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">{auction.title}</h3>
                            <div className="flex justify-between items-center">
                              <button className="text-[#7a2c1b] font-semibold hover:underline">
                                Continuar edición
                              </button>
                              <button className="text-red-600 font-semibold hover:underline">
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "history" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de pujas</h2>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="divide-y">
                    {bids.map((bid) => (
                      <div key={bid.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={bid.auction.image_url || "/placeholder.jpg"}
                              alt={bid.auction.title}
                              fill
                              className="object-cover"
                              quality={90}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{bid.auction.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(bid.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Tu puja</p>
                          <p className="text-lg font-bold text-[#7a2c1b]">${bid.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "favorites" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Favoritos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={fav.auction.image_url || "/placeholder.jpg"}
                          alt={fav.auction.title}
                          fill
                          className="object-cover"
                          quality={90}
                        />
                        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition">
                          <Heart className="w-5 h-5 text-red-500 fill-current" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{fav.auction.title}</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Precio actual</p>
                            <p className="text-xl font-bold text-[#7a2c1b]">${fav.auction.current_price?.toLocaleString?.() ?? "-"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Termina en</p>
                            <p className="text-sm font-semibold text-[#7a2c1b]">
                              {fav.auction.end_time ? Math.ceil((new Date(fav.auction.end_time).getTime() - Date.now()) / (1000 * 60 * 60)) : "-"} horas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={profile.full_name || ""}
                        className="w-full border rounded-lg p-2"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full border rounded-lg p-2"
                        readOnly
                      />
                    </div>
                    {/* Aquí puedes agregar edición real si lo deseas */}
                  </form>
                </div>
              </div>
            )}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notificaciones</h2>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden divide-y">
                  {notifications.length === 0 && (
                    <div className="p-6 text-gray-500 text-center">No tienes notificaciones.</div>
                  )}
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 flex items-center gap-4 ${notif.read ? '' : 'bg-yellow-50'}`}>
                      <Bell className="w-5 h-5 text-[#7a2c1b]" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{notif.title}</h3>
                        <p className="text-gray-600 text-sm">{notif.message}</p>
                        <p className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</p>
                      </div>
                      {!notif.read && (
                        <button
                          className="text-xs text-[#7a2c1b] underline"
                          onClick={async () => {
                            await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
                          }}
                        >Marcar como leída</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "messages" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mensajes</h2>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden divide-y">
                  {messages.length === 0 && (
                    <div className="p-6 text-gray-500 text-center">No tienes mensajes.</div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`p-4 flex flex-col gap-1 ${!msg.read && msg.receiver_id === user.id ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#7a2c1b]">{msg.sender_id === user.id ? 'Tú' : 'Otro usuario'}</span>
                        <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-gray-900">{msg.message}</div>
                      {msg.auction && (
                        <div className="text-xs text-gray-500">Subasta: {msg.auction.title}</div>
                      )}
                      {!msg.read && msg.receiver_id === user.id && (
                        <button
                          className="text-xs text-[#7a2c1b] underline mt-1"
                          onClick={async () => {
                            await supabase.from("messages").update({ read: true }).eq("id", msg.id);
                          }}
                        >Marcar como leído</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 