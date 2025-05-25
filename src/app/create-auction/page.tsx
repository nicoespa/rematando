"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { Home, Car, Gem, Star } from "lucide-react";

const categories = [
  { id: "inmuebles", name: "Inmuebles", icon: Home },
  { id: "autos", name: "Autos", icon: Car },
  { id: "coleccionables", name: "Coleccionables", icon: Gem },
  { id: "destacados", name: "Destacados", icon: Star },
];

export default function CreateAuction() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    image_url: "",
    base_price: "",
    duration_minutes: "60",
    end_time: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Paso 1: Detalles
  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setError(null);
    setStep(2);
  };

  // Paso 2: Imagen
  const handleImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Debes subir una imagen principal.");
      return;
    }
    setError(null);
    setStep(3);
  };

  // Paso 3: Precio y duración
  const handlePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.base_price || isNaN(Number(form.base_price)) || Number(form.base_price) <= 0) {
      setError("El precio base debe ser mayor a 0.");
      return;
    }
    if (!form.duration_minutes || isNaN(Number(form.duration_minutes)) || Number(form.duration_minutes) < 10) {
      setError("La duración debe ser de al menos 10 minutos.");
      return;
    }
    setError(null);
    setStep(4);
  };

  // Subida de imagen a Supabase Storage (mock, reemplazar por real si tienes bucket)
  async function uploadImage(file: File) {
    // Aquí deberías subir la imagen a Supabase Storage y devolver la URL
    // Por ahora, solo usamos una URL mock
    return URL.createObjectURL(file);
  }

  // Publicar o guardar como borrador
  const handleSubmit = async (publish: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    let imageUrl = form.image_url;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    const end_time = new Date(Date.now() + parseInt(form.duration_minutes) * 60000).toISOString();
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
    const { error } = await supabase.from("auctions").insert({
      ...form,
      image_url: imageUrl,
      base_price: parseFloat(form.base_price),
      current_price: parseFloat(form.base_price),
      end_time,
      user_id,
      status: publish ? "active" : "draft",
    });
    setLoading(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auction");
      }, 1500);
    } else {
      setError("Error al publicar la subasta: " + error.message);
    }
  };

  // Renderizado de pasos
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-6 text-[#7a2c1b]">Publicar subasta</h1>
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg border-2 ${step === n ? "bg-[#7a2c1b] text-white border-[#7a2c1b]" : "bg-gray-100 text-gray-500 border-gray-300"}`}>{n}</div>
        ))}
      </div>
      {step === 1 && (
        <form onSubmit={handleDetails} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Título de la subasta"
            className="border p-2 rounded"
            maxLength={60}
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Descripción detallada"
            className="border p-2 rounded min-h-[80px]"
            maxLength={400}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                type="button"
                key={cat.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${form.category === cat.id ? "bg-[#7a2c1b] text-white border-[#7a2c1b]" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                onClick={() => setForm({ ...form, category: cat.id })}
              >
                <cat.icon className="w-5 h-5" /> {cat.name}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{form.title.length}/60</span>
            <span>{form.description.length}/400</span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="submit" className="bg-[#7a2c1b] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a9442a] transition">Siguiente</button>
          </div>
          {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleImage} className="flex flex-col gap-4 items-center">
          <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-[#7a2c1b] transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-40 h-40 object-cover rounded mb-2" />
            ) : (
              <span className="text-gray-500">Arrastrá o hacé click para subir una imagen</span>
            )}
          </label>
          <div className="flex justify-between w-full mt-4">
            <button type="button" className="px-6 py-2 rounded-full font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition" onClick={() => setStep(1)}>Atrás</button>
            <button type="submit" className="bg-[#7a2c1b] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a9442a] transition">Siguiente</button>
          </div>
          {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handlePrice} className="flex flex-col gap-4">
          <input
            type="number"
            min={1}
            placeholder="Precio base (ARS)"
            className="border p-2 rounded"
            value={form.base_price}
            onChange={e => setForm({ ...form, base_price: e.target.value })}
            required
          />
          <input
            type="number"
            min={10}
            placeholder="Duración (minutos)"
            className="border p-2 rounded"
            value={form.duration_minutes}
            onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
            required
          />
          <div className="flex justify-between mt-4">
            <button type="button" className="px-6 py-2 rounded-full font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition" onClick={() => setStep(2)}>Atrás</button>
            <button type="submit" className="bg-[#7a2c1b] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a9442a] transition">Siguiente</button>
          </div>
          {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
        </form>
      )}
      {step === 4 && (
        <div className="flex flex-col gap-6 items-center">
          <h2 className="text-xl font-bold text-[#7a2c1b] mb-2">Previsualización</h2>
          <div className="w-full bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center">
            {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-40 h-40 object-cover rounded mb-2" />}
            <h3 className="text-lg font-bold mb-1">{form.title}</h3>
            <span className="inline-block px-2 py-1 text-xs bg-[#fbeee6] text-[#7a2c1b] rounded mb-2">{categories.find(c => c.id === form.category)?.name}</span>
            <p className="text-gray-700 mb-2 text-center">{form.description}</p>
            <span className="text-xl font-bold text-[#7a2c1b] mb-1">${form.base_price}</span>
            <span className="text-xs text-gray-500">Duración: {form.duration_minutes} min</span>
          </div>
          <div className="flex justify-between w-full gap-2 mt-4">
            <button type="button" className="px-6 py-2 rounded-full font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition" onClick={() => setStep(3)}>Atrás</button>
            <button type="button" className="bg-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold hover:bg-gray-400 transition" onClick={() => handleSubmit(false)} disabled={loading}>{loading ? "Guardando..." : "Guardar como borrador"}</button>
            <button type="button" className="bg-[#7a2c1b] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a9442a] transition" onClick={() => handleSubmit(true)} disabled={loading}>{loading ? "Publicando..." : "Publicar subasta"}</button>
          </div>
          {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
          {success && <div className="text-green-700 text-sm text-center font-semibold">¡Subasta publicada!</div>}
        </div>
      )}
    </div>
  );
}