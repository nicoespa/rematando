"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Trae favoritos y hace join con auctions
        const { data, error } = await supabase
          .from("favorites")
          .select("id, auction:auction_id (id, title, image_url, base_price, current_price)")
          .eq("user_id", user.id);

        setFavorites(data || []);
      }
      setLoading(false);
    }
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-primary-700">Mis favoritos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse card h-28" />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-gray-600">Debes iniciar sesión para ver tus favoritos.</p>
        <Link href="/login" className="btn-primary mt-4 inline-block">Iniciar sesión</Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-700">Mis favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-500">No tienes subastas favoritas aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((fav) => (
            <Link href={`/auction/${fav.auction.id}`} key={fav.id}>
              <div className="card cursor-pointer group flex items-center gap-4">
                <img src={fav.auction.image_url || "/placeholder.jpg"} alt={fav.auction.title} className="w-32 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                <div>
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">{fav.auction.title}</h3>
                  <span className="font-bold text-primary-600">
                    ${fav.auction.current_price || fav.auction.base_price}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
} 