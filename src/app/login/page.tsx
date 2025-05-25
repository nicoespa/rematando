"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        setError("Email o contraseña incorrectos.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Debes confirmar tu email antes de ingresar. Revisá tu bandeja de entrada.");
      } else {
        setError(error.message);
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-[#7a2c1b] text-white px-4 py-2 rounded w-full font-bold hover:bg-[#a9442a] transition"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      </form>
      <p className="text-center text-sm mt-4">
        ¿No tienes cuenta? <a href="/signup" className="text-[#7a2c1b] underline">Registrate</a>
      </p>
    </div>
  );
}
