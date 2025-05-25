import React from "react";
import Link from "next/link";

const trending = [
  {
    id: 1,
    title: "Casa en Nordelta",
    image: "/trending-casa.jpg",
    price: 120000000,
    category: "Inmuebles",
    timeLeft: "2h 15m",
  },
  {
    id: 2,
    title: "Ford Mustang 2020",
    image: "/trending-auto.jpg",
    price: 35000000,
    category: "Autos",
    timeLeft: "1h 5m",
  },
  {
    id: 3,
    title: "Caballo Criollo Campeón",
    image: "/trending-caballo.jpg",
    price: 8000000,
    category: "Caballos",
    timeLeft: "45m",
  },
];

export default function TrendingAuctions() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-primary-700">Subastas en tendencia</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trending.map((item) => (
          <Link href={`/auction/${item.id}`} key={item.id}>
            <div className="card cursor-pointer group">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform" />
              <div className="p-4">
                <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded mb-2">{item.category}</span>
                <h3 className="text-lg font-semibold mb-1 line-clamp-1">{item.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="font-bold text-primary-600">${item.price.toLocaleString('es-AR')}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{item.timeLeft}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 