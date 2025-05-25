"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export default function SellerProfilePage({ params }: { params: { id: string } }) {
  const [seller, setSeller] = useState<any>(null);
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSellerProfile() {
      setLoading(true);
      // Perfil vendedor
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();
      setSeller(sellerData);
      // Subastas activas
      const { data: auctionsData } = await supabase
        .from("auctions")
        .select("id, title")
        .eq("user_id", params.id)
        .gt("end_time", new Date().toISOString());
      setActiveAuctions(auctionsData || []);
      // Comentarios
      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, rating, comment, user:user_id (full_name)")
        .eq("seller_id", params.id)
        .order("created_at", { ascending: false });
      setComments(commentsData || []);
      setLoading(false);
    }
    fetchSellerProfile();
  }, [params.id]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="animate-pulse bg-white rounded-lg shadow p-6 h-40 mb-8" />
        <div className="animate-pulse bg-white rounded-lg shadow p-4 h-32 mb-6" />
        <div className="animate-pulse bg-white rounded-lg shadow p-4 h-32" />
      </main>
    );
  }

  if (!seller) {
    return (
      <main className="max-w-3xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-gray-600">Vendedor no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-white rounded-lg shadow p-6">
        <img src={seller.avatar_url || "/avatar-seller.jpg"} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-primary-200" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{seller.full_name || "Vendedor"}</h1>
          <div className="flex gap-4 items-center text-sm text-gray-600 mb-2">
            <span>Reputación: <span className="font-semibold text-primary-600">{seller.reputation ?? "5.0"}★</span></span>
            <span>Ventas: <span className="font-semibold">{seller.sales ?? 0}</span></span>
            <span>Subastas activas: <span className="font-semibold">{activeAuctions.length}</span></span>
          </div>
          <Link href={`/messages?seller=${seller.id}`} className="btn-primary">Enviar mensaje</Link>
        </div>
      </div>
      <section className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-bold text-lg mb-2">Comentarios y reputación</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          {comments.length === 0 ? (
            <li>No hay comentarios aún.</li>
          ) : (
            comments.map((c) => (
              <li key={c.id}>
                <span className="font-semibold">{c.user?.full_name || "Usuario"}:</span> {c.comment} <span className="text-yellow-500">{"★".repeat(c.rating)}</span>
              </li>
            ))
          )}
        </ul>
      </section>
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-lg mb-2">Subastas activas</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          {activeAuctions.length === 0 ? (
            <li>No hay subastas activas.</li>
          ) : (
            activeAuctions.map((a) => (
              <li key={a.id}>{a.title}</li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
} 