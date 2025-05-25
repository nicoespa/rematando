"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";
import { Clock, DollarSign, Filter, SortAsc, SortDesc } from "lucide-react";

// Tipos para las subastas y categorías
interface Auction {
  id: number;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  end_time: string;
  category: string;
  bids: { id: number }[];
  status: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AuctionsList() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    category: categoryParam || "",
    minPrice: "",
    maxPrice: "",
    timeLeft: "all", // all, ending-soon, new
  });
  const [sortBy, setSortBy] = useState("ending-soon"); // ending-soon, price-asc, price-desc, newest
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch subastas y categorías reales
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch subastas activas
        const { data: auctionsData, error: auctionsError } = await supabase
          .from("auctions")
          .select("*, bids (id)")
          .eq("status", "active");

        if (auctionsError) throw auctionsError;
        setAuctions(auctionsData || []);

        // Fetch categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Suscripción realtime a cambios en subastas
    const channel = supabase.channel('auctions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Aplicar filtros y ordenamiento
  const filteredAuctions = auctions
    .filter((a) => {
      if (filters.category && a.category !== filters.category) return false;
      if (filters.minPrice && a.current_price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && a.current_price > Number(filters.maxPrice)) return false;
      if (filters.timeLeft === "ending-soon") {
        const hoursLeft = (new Date(a.end_time).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursLeft > 24) return false;
      } else if (filters.timeLeft === "new") {
        const hoursSinceStart = (Date.now() - new Date(a.end_time).getTime() + 7 * 24 * 60 * 60 * 1000) / (1000 * 60 * 60);
        if (hoursSinceStart > 24) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "ending-soon":
          return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        case "price-asc":
          return a.current_price - b.current_price;
        case "price-desc":
          return b.current_price - a.current_price;
        case "newest":
          return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
        default:
          return 0;
      }
    });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#7a2c1b]">Subastas</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition"
            >
              <option value="ending-soon">Terminando pronto</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio mínimo</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="Mínimo"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio máximo</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Máximo"
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo restante</label>
                <select
                  value={filters.timeLeft}
                  onChange={(e) => setFilters({ ...filters, timeLeft: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="all">Todos</option>
                  <option value="ending-soon">Terminando pronto</option>
                  <option value="new">Nuevas</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de subastas */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Cargando subastas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/auction/${auction.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative h-48">
                  <Image
                    src={auction.image_url}
                    alt={auction.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-[#7a2c1b] text-white px-3 py-1 rounded-full text-sm">
                    {auction.bids?.length || 0} pujas
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{auction.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
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
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron subastas con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </main>
  );
} 