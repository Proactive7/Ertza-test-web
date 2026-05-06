"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const SESSION_ID_KEY = "ertzatest_session_id";
const LAST_ACTIVITY_KEY = "ertzatest_last_activity_at";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user?.id) {
      setLoading(false);
      setMessage("Email o contraseña incorrectos.");
      return;
    }

    const sessionId = createSessionId();

    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_ID_KEY, sessionId);
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    const { error: sessionError } = await supabase
      .from("active_sessions")
      .upsert(
        {
          user_id: data.user.id,
          session_id: sessionId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    setLoading(false);

    if (sessionError) {
      console.error("Error registrando sesión activa:", sessionError.message);
      setMessage("No se ha podido iniciar la sesión correctamente.");
      await supabase.auth.signOut();
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d8dde4] px-4 py-8">
      <div className="w-full max-w-md rounded-[22px] border border-white/60 bg-white p-6 shadow-xl">
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
            autoComplete="email"
            required
          />

          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#123b86]"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#123b86] py-3 text-sm font-bold text-white transition hover:bg-[#0f3577] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {message}
            </p>
          )}
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center">
          <p className="text-sm text-slate-600">¿No tienes cuenta?</p>

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