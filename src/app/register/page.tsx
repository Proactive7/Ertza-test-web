"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== repeatPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Cuenta creada correctamente. Revisa tu correo.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d8dde4] px-4 py-4">
      <div className="w-full max-w-md rounded-[24px] border border-white/60 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.12)] md:p-6">
        
        {/* LOGO GRANDE */}
        <div className="mb-2 flex justify-center">
          <Link href="/">
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="h-[60px] object-contain"
            />
          </Link>
        </div>

        {/* TITULO */}
        <h1 className="text-center text-[26px] font-extrabold text-[#123b86]">
          Crear cuenta
        </h1>

        <p className="mt-1 text-center text-xs text-slate-500">
          Empieza a preparar tu oposición
        </p>

        {/* FORM */}
        <form onSubmit={handleRegister} className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#123b86] focus:ring-2 focus:ring-[#dbe7ff]"
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#123b86] focus:ring-2 focus:ring-[#dbe7ff]"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#123b86] focus:ring-2 focus:ring-[#dbe7ff]"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#123b86] focus:ring-2 focus:ring-[#dbe7ff]"
            type="password"
            placeholder="Repetir contraseña"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#123b86] py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(18,59,134,0.20)] transition hover:bg-[#0f3577] disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>

          {message && (
            <p className="rounded-lg bg-[#f8fbff] px-3 py-2 text-center text-xs font-semibold text-[#123b86]">
              {message}
            </p>
          )}
        </form>

        {/* FOOTER */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-bold text-[#123b86] hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}