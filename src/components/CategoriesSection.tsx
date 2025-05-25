import React from "react";
import { Home, Car, Gem, Star } from "lucide-react";

const categories = [
  { id: "inmuebles", name: "Inmuebles", icon: Home },
  { id: "autos", name: "Autos", icon: Car },
  { id: "coleccionables", name: "Coleccionables", icon: Gem },
  { id: "destacados", name: "Destacados", icon: Star },
];

export default function CategoriesSection() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-primary-700">Categorías populares</h2>
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center bg-white rounded-lg shadow-sm p-4 w-32 hover:bg-primary-50 cursor-pointer transition-colors">
            <cat.icon className="w-8 h-8 text-primary-600 mb-2" />
            <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 