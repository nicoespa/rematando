"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import { Star, Clock, DollarSign, MessageSquare, Heart, Share2, CheckCircle, Truck, AlertCircle } from "lucide-react";

interface Bid {
  id: number;
  amount: number;
  user_id: string;
  created_at: string;
  user?: { id: string; name: string; avatar_url: string };
}

interface Seller {
  id: string;
  name: string;
  avatar_url: string;
  rating: number;
  total_sales: number;
  verified: boolean;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  min_increment: number;
  end_time: string;
  status: string;
  seller_id: string;
  seller?: Seller;
  bids: Bid[];
  shipping_info?: string;
}

export default function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch auction, seller, bids, questions
  useEffect(() => {
    async function fetchAuction() {
      setLoading(true);
      console.log("Fetching auction with ID:", id);
      const { data: auctionData, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("id", id)
        .single();
      console.log("Auction data:", auctionData);
      console.log("Error if any:", error);
      if (!auctionData) {
        setAuction(null);
        setLoading(false);
        return;
      }
      setAuction({ ...auctionData, bids: [] });
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

  // Countdown real
  useEffect(() => {
    if (!auction) return;
    function updateCountdown() {
      if (!auction) return;
      const diff = new Date(auction.end_time).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Finalizada");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }
    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [auction]);

  // Favoritos (mock, reemplazar por lógica real)
  const handleFavorite = () => setIsFavorite((f) => !f);

  // Compartir (Web Share API)
  const handleShare = () => {
    if (navigator.share && auction) {
      navigator.share({
        title: auction.title,
        text: auction.description,
        url: window.location.href,
      });
    }
  };

  // Preguntas (mock, reemplazar por lógica real)
  const handleQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText) return;
    setQuestions((q) => [...q, { text: questionText, user: "Tú", created_at: new Date().toISOString() }]);
    setQuestionText("");
  };

  // Puja profesional: mínimo incremental, anti-sniping, validación backend
  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!auction) return;
    const amount = Number(bidAmount);
    const minBid = auction.current_price + (auction.min_increment || 1);
    if (isNaN(amount) || amount < minBid) {
      setError(`La puja mínima es $${minBid.toLocaleString()}`);
      setLoading(false);
      return;
    }
    // Validación backend y anti-sniping (mock)
    // TODO: Lógica real en backend (RLS, función, trigger)
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
                  src={auction.image_url || "/placeholder.jpg"}
                  alt={auction.title}
                  fill
                  className="object-cover"
                  quality={90}
                />
                {/* Estado y acciones */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${auction.status === "active" ? "bg-green-100 text-green-700" : auction.status === "finished" ? "bg-gray-200 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>{auction.status === "active" ? "Activa" : auction.status === "finished" ? "Finalizada" : "Próxima"}</span>
                  {auction.seller?.verified && <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"><CheckCircle className="w-4 h-4" /> Vendedor verificado</span>}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={handleFavorite} className={`p-2 rounded-full shadow ${isFavorite ? "bg-red-100 text-red-600" : "bg-white text-gray-600"}`} title="Agregar a favoritos"><Heart className="w-5 h-5" /></button>
                  <button onClick={handleShare} className="p-2 rounded-full shadow bg-white text-gray-600" title="Compartir"><Share2 className="w-5 h-5" /></button>
                </div>
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
                    <p className="text-2xl font-bold text-[#7a2c1b]">{timeLeft}</p>
                  </div>
                </div>
                {/* Formulario de puja */}
                <form onSubmit={handleBid} className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Realizar una puja</h2>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min={auction.current_price + (auction.min_increment || 1)}
                      step={auction.min_increment || 1}
                      placeholder={`Monto mínimo: $${auction.current_price + (auction.min_increment || 1)}`}
                      className="flex-1 border p-2 rounded"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                      disabled={auction.status !== "active"}
                    />
                    <button
                      type="submit"
                      className="bg-[#7a2c1b] text-white px-6 py-2 rounded font-bold hover:bg-[#a9442a] transition disabled:opacity-50"
                      disabled={loading || !bidAmount || Number(bidAmount) < auction.current_price + (auction.min_increment || 1) || auction.status !== "active"}
                    >
                      {loading ? "Procesando..." : "Pujar"}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Incremento mínimo: ${auction.min_increment || 1}</div>
                  {error && <p className="text-red-600 mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                  {success && <p className="text-green-600 mt-2">¡Puja realizada con éxito!</p>}
                </form>
                {/* Info de envío */}
                {auction.shipping_info && (
                  <div className="flex items-center gap-2 mt-4 text-gray-700 bg-blue-50 p-3 rounded"><Truck className="w-5 h-5" />{auction.shipping_info}</div>
                )}
              </div>
            </div>
            {/* Preguntas y respuestas */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">Preguntas y respuestas</h2>
              <form onSubmit={handleQuestion} className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="flex-1 border p-2 rounded"
                  placeholder="Escribe tu pregunta..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  disabled={auction.status !== "active"}
                />
                <button type="submit" className="bg-[#7a2c1b] text-white px-4 py-2 rounded font-bold hover:bg-[#a9442a] transition disabled:opacity-50" disabled={!questionText || auction.status !== "active"}>Preguntar</button>
              </form>
              <div className="divide-y">
                {questions.length === 0 && <p className="text-gray-500">Aún no hay preguntas.</p>}
                {questions.map((q, i) => (
                  <div key={i} className="py-3">
                    <div className="font-semibold">{q.user}</div>
                    <div className="text-gray-700">{q.text}</div>
                    <div className="text-xs text-gray-400">{new Date(q.created_at).toLocaleString()}</div>
                  </div>
                ))}
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
                      src={auction.seller.avatar_url || "/avatar-placeholder.png"}
                      alt={auction.seller.name}
                      fill
                      className="object-cover"
                      quality={90}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-1">{auction.seller.name} {auction.seller.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}</h3>
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
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={bid.user?.avatar_url || "/avatar-placeholder.png"}
                            alt={bid.user?.name || bid.user_id}
                            fill
                            className="object-cover"
                            quality={90}
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{bid.user?.name || `Usuario ${bid.user_id}`}</p>
                          <p className="text-xs text-gray-500">{new Date(bid.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-[#7a2c1b]">${bid.amount.toLocaleString()}</p>
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