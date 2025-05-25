"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, LogIn, LogOut, User, Star, Bell, MessageSquare } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import Image from "next/image";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

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
        <div className="flex-1 flex justify-center">
          <nav className="flex gap-6 text-base font-medium text-[#7a2c1b]">
            <Link href="/auctions?category=inmuebles" className="hover:text-[#a9442a] transition">Inmuebles</Link>
            <Link href="/auctions?category=autos" className="hover:text-[#a9442a] transition">Autos</Link>
            <Link href="/auctions?category=coleccionables" className="hover:text-[#a9442a] transition">Coleccionables</Link>
            <Link href="/auctions?category=destacados" className="hover:text-[#a9442a] transition">Destacados</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link href="/login" className="px-4 py-2 rounded-full font-semibold text-[#7a2c1b] border border-[#7a2c1b] hover:bg-[#7a2c1b] hover:text-white transition">Iniciar sesión</Link>
              <Link href="/signup" className="px-4 py-2 rounded-full font-semibold bg-[#7a2c1b] text-white hover:bg-[#a9442a] transition shadow">Registrarse</Link>
            </>
          )}
          {user && (
            <>
              <Link href="/profile" className={`flex items-center px-3 py-2 rounded-full text-sm font-medium text-[#7a2c1b] hover:bg-[#f3e7e2] transition ${isActive('/profile') ? 'bg-[#f3e7e2]' : ''}`}>Mi perfil</Link>
              <Link href="/create-auction" className="px-4 py-2 rounded-full font-semibold bg-[#7a2c1b] text-white hover:bg-[#a9442a] transition shadow">Publicar</Link>
              <button onClick={handleLogout} className="px-4 py-2 rounded-full font-semibold text-[#7a2c1b] border border-[#7a2c1b] hover:bg-[#7a2c1b] hover:text-white transition">Cerrar sesión</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 