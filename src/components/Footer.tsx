import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 py-8 text-center text-gray-600">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-primary-600 font-bold text-lg">RematesAR</span>
          <span className="text-xs text-gray-400">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-primary-600">Inicio</Link>
          <Link href="/auction" className="hover:text-primary-600">Subastas</Link>
          <Link href="/favorites" className="hover:text-primary-600">Favoritos</Link>
          <Link href="/profile" className="hover:text-primary-600">Mi perfil</Link>
          <Link href="/about" className="hover:text-primary-600">Sobre nosotros</Link>
        </div>
        <div className="text-xs text-gray-400">Hecho con ❤️ en Argentina</div>
      </div>
    </footer>
  );
} 