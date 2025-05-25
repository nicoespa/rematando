import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#f9f6f2] via-[#fbeee6] to-[#f9f6f2] py-12 md:py-20 flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <Image src="/logo.png" alt="Rematando" width={90} height={90} className="mx-auto mb-2" priority />
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#7a2c1b] leading-tight mb-2 drop-shadow-sm">
          Subastas <span className="text-[#a9442a]">inteligentes</span>,<br /> seguras y simples
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-4">
          La nueva forma de comprar y vender en Argentina. Seguridad, transparencia y oportunidades únicas en cada remate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auction" className="px-8 py-3 rounded-full font-bold bg-[#7a2c1b] text-white text-lg shadow hover:bg-[#a9442a] transition">Ver subastas activas</Link>
          <Link href="/create-auction" className="px-8 py-3 rounded-full font-bold border-2 border-[#7a2c1b] text-[#7a2c1b] text-lg hover:bg-[#f3e7e2] transition">Publicá tu producto</Link>
        </div>
      </div>
    </section>
  );
} 