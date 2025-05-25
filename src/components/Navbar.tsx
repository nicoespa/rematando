"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, LogIn, LogOut, User, Star, Bell, MessageSquare, Menu, X } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import Image from "next/image";

const categories = [
  { name: "Inmuebles", href: "/auctions?category=inmuebles" },
  { name: "Autos", href: "/auctions?category=autos" },
  { name: "Coleccionables", href: "/auctions?category=coleccionables" },
  { name: "Destacados", href: "/auctions?category=destacados" },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#f9f6f2] shadow-md sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-20 justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rematando" width={44} height={44} className="rounded-md" priority />
            <span className="text-2xl font-extrabold text-[#7a2c1b] tracking-tight hidden sm:inline">REMATANDO</span>
          </Link>
        </div>
        <button
          className="lg:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#7a2c1b]"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-7 h-7 text-[#7a2c1b]" />
        </button>
        <div className="hidden lg:flex flex-1 justify-center">
          <nav className="flex gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href} className="text-[#7a2c1b] font-semibold hover:underline underline-offset-4 transition">
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden lg:flex gap-4 items-center">
          {!user && (
            <>
              <Link href="/login" className="text-[#7a2c1b] font-semibold hover:underline">Iniciar sesión</Link>
              <Link href="/signup" className="bg-[#7a2c1b] text-white px-4 py-2 rounded font-bold hover:bg-[#a9442a] transition">Registrarse</Link>
            </>
          )}
          {user && (
            <>
              <Link href="/profile" className="text-[#7a2c1b] font-semibold hover:underline">Mi perfil</Link>
              <Link href="/auctions/new" className="bg-[#7a2c1b] text-white px-4 py-2 rounded font-bold hover:bg-[#a9442a] transition">Publicar</Link>
              <button onClick={handleLogout} className="text-[#7a2c1b] font-semibold hover:underline">Cerrar sesión</button>
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <div className="bg-white w-4/5 max-w-xs h-full shadow-lg p-6 flex flex-col animate-slide-in">
            <button
              className="self-end mb-6 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#7a2c1b]"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
            >
              <X className="w-7 h-7 text-[#7a2c1b]" />
            </button>
            <nav className="flex flex-col gap-4 mb-8">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="text-[#7a2c1b] text-lg font-semibold hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-4 mt-auto">
              {!user && (
                <>
                  <Link href="/login" className="text-[#7a2c1b] font-semibold hover:underline" onClick={() => setOpen(false)}>Iniciar sesión</Link>
                  <Link href="/signup" className="bg-[#7a2c1b] text-white px-4 py-2 rounded font-bold hover:bg-[#a9442a] transition" onClick={() => setOpen(false)}>Registrarse</Link>
                </>
              )}
              {user && (
                <>
                  <Link href="/profile" className="text-[#7a2c1b] font-semibold hover:underline" onClick={() => setOpen(false)}>Mi perfil</Link>
                  <Link href="/auctions/new" className="bg-[#7a2c1b] text-white px-4 py-2 rounded font-bold hover:bg-[#a9442a] transition" onClick={() => setOpen(false)}>Publicar</Link>
                  <button onClick={handleLogout} className="text-[#7a2c1b] font-semibold hover:underline">Cerrar sesión</button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setOpen(false)} />
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </nav>
  );
} 