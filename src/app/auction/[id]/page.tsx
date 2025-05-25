"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import { Star, Clock, DollarSign, MessageSquare } from "lucide-react";

interface Bid {
  id: number;
  amount: number;
  user_id: string;
  created_at: string;
}

interface Seller {
  id: string;
  name: string;
  avatar_url: string;
  rating: number;
  total_sales: number;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  end_time: string;
  status: string;
  seller_id: string;
  seller?: Seller;
  bids: Bid[];
}

export default function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch auction, seller, and bids
  useEffect(() => {
    async function fetchAuction() {
      setLoading(true);
      console.log("ID recibido:", id); // LOG 1
      const { data: auctionData, error } = await supabase
        .from("auctions")
        .select("*") // sin join
        .eq("id", id)
        .single();
      console.log("auctionData:", auctionData, "error:", error); // LOG 2
      if (!auctionData) {
        setAuction(null);
        setLoading(false);
        return;
      }
      // Fetch bids
      const { data: bidsData } = await supabase
        .from("bids")
        .select("id, amount, user_id, created_at")
        .eq("auction_id", id)
        .order("created_at", { ascending: false });
      setAuction({ ...auctionData, bids: bidsData || [] });
      setLoading(false);
    }
    fetchAuction();
    // Suscripción realtime a pujas y cambios de subasta
    const channel = supabase.channel('auction-realtime-' + id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `auction_id=eq.${id}` }, () => {
        fetchAuction();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions', filter: `id=eq.${id}` }, () => {
        fetchAuction();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!auction) return;
    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= auction.current_price) {
      setError("La puja debe ser mayor al precio actual");
      setLoading(false);
      return;
    }
    // Insertar puja
    const { error: bidError } = await supabase.from("bids").insert({
      auction_id: auction.id,
      amount,
      user_id: "user1" // TODO: Reemplazar por el usuario autenticado
    });
    if (bidError) {
      setError("Error al realizar la puja");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setBidAmount("");
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Cargando subasta...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Subasta no encontrada</h1>
          <p className="text-gray-600">La subasta que buscas no existe o ha sido eliminada.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Imagen y detalles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-96">
                <Image
                  src={auction.image_url}
                  alt={auction.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>
                <p className="text-gray-600 mb-6">{auction.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign className="w-5 h-5" />
                      <span>Precio actual</span>
                    </div>
                    <p className="text-2xl font-bold text-[#7a2c1b]">${auction.current_price.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="w-5 h-5" />
                      <span>Tiempo restante</span>
                    </div>
                    <p className="text-2xl font-bold text-[#7a2c1b]">
                      {Math.ceil((new Date(auction.end_time).getTime() - Date.now()) / (1000 * 60 * 60))} horas
                    </p>
                  </div>
                </div>
                {/* Formulario de puja */}
                <form onSubmit={handleBid} className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Realizar una puja</h2>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min={auction.current_price + 1}
                      placeholder="Monto de la puja"
                      className="flex-1 border p-2 rounded"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#7a2c1b] text-white px-6 py-2 rounded font-bold hover:bg-[#a9442a] transition disabled:opacity-50"
                      disabled={loading || !bidAmount || Number(bidAmount) <= auction.current_price}
                    >
                      {loading ? "Procesando..." : "Pujar"}
                    </button>
                  </div>
                  {error && <p className="text-red-600 mt-2">{error}</p>}
                  {success && <p className="text-green-600 mt-2">¡Puja realizada con éxito!</p>}
                </form>
              </div>
            </div>
          </div>
          {/* Columna derecha - Vendedor e historial */}
          <div className="space-y-6">
            {/* Información del vendedor */}
            {auction.seller && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Información del vendedor</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={auction.seller.avatar_url}
                      alt={auction.seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{auction.seller.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{auction.seller.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">{auction.seller.total_sales} ventas</p>
                  </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition">
                  <MessageSquare className="w-5 h-5" />
                  Contactar vendedor
                </button>
              </div>
            )}
            {/* Historial de pujas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Historial de pujas</h2>
              {auction.bids.length > 0 ? (
                <div className="space-y-4">
                  {auction.bids.map((bid) => (
                    <div key={bid.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                      <div>
                        <p className="font-semibold">Usuario {bid.user_id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-[#7a2c1b]">
                        ${bid.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aún no hay pujas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}