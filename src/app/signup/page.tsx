"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="text-green-700 text-sm text-center font-semibold">¡Cuenta creada! Redirigiendo...</div>}
      </form>
      <p className="text-center text-sm mt-4">
        ¿Ya tienes cuenta? <a href="/login" className="text-[#7a2c1b] underline">Iniciar sesión</a>
      </p>
    </div>
  );
}
