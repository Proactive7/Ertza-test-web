"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Email o contraseña incorrectos.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#d8dde4] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-xl border border-white/60">
        <div className="mb-6 text-center">
          <Link href="/">
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="mx-auto h-[58px] w-auto object-contain"
            />
          </Link>

          <h1 className="mt-5 text-3xl font-extrabold text-[#123b86]">
            Iniciar sesión
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Accede a tu cuenta y observa el progreso.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#123b86]"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#123b86]"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#123b86] py-3 text-sm font-bold text-white transition hover:bg-[#0f3577] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {message}
            </p>
          )}
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center">
          <p className="text-sm text-slate-600">
            ¿No tienes cuenta?
          </p>

          <Link
            href="/register"
            className="mt-2 inline-block rounded-xl border border-[#123b86] px-5 py-2 text-sm font-bold text-[#123b86] transition hover:bg-[#eef5ff]"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </main>
  );
}