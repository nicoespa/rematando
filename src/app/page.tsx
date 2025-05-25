import Link from "next/link";
import Image from "next/image";
import { Car, Gem, Star } from "lucide-react";
import supabase from "@/lib/supabaseClient";

export default async function Home() {
  // Obtener subasta destacada (la más cara)
  const { data: featuredAuction } = await supabase
    .from("auctions")
    .select("*")
    .eq("status", "active")
    .order("current_price", { ascending: false })
    .limit(1)
    .single();

  // Obtener categorías
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .limit(8);

  // Obtener subastas destacadas (las más recientes)
  const { data: auctions } = await supabase
    .from("auctions")
    .select("*, bids (id)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero principal */}
      {featuredAuction && (
        <section className="relative h-[480px] md:h-[600px] w-full flex items-center justify-center overflow-hidden">
          <Image
            src={featuredAuction.image_url}
            alt={featuredAuction.title}
            fill
            className="object-cover object-center brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              {featuredAuction.title}
            </h1>
            <p className="text-xl mb-6 drop-shadow-lg">
              {featuredAuction.description}
            </p>
            <Link
              href={`/auction/${featuredAuction.id}`}
              className="inline-block bg-white text-[#7a2c1b] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Ver Subasta Destacada
            </Link>
          </div>
        </section>
      )}

      {/* Categorías destacadas */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#7a2c1b] text-center">Categorías Destacadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/auctions?category=${category.id}`}
                className="group bg-gray-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col items-center"
              >
                <div className="relative w-full h-28 md:h-32">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Subastas destacadas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#7a2c1b] text-center">Subastas Destacadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions?.map((auction) => (
              <Link
                key={auction.id}
                href={`/auction/${auction.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition flex flex-col"
              >
                <div className="relative h-56">
                  <Image
                    src={auction.image_url}
                    alt={auction.title}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute top-2 right-2 bg-[#7a2c1b] text-white px-3 py-1 rounded-full text-sm shadow">
                    {auction.bids?.length || 0} pujas
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">{auction.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
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
        </div>
      </section>
    </main>
  );
}