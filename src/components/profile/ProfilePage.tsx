"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ProfilePageProps = {
  user: User | null;
  hasActiveSubscription: boolean;
  onBack: () => void;
  onLogout: () => void | Promise<void>;
};

export default function ProfilePage({
  user,
  hasActiveSubscription,
  onBack,
  onLogout,
}: ProfilePageProps) {
  const fallbackUsername = user?.email?.split("@")[0] || "Usuario";

  const [username, setUsername] = useState(fallbackUsername);
  const [savedUsername, setSavedUsername] = useState(fallbackUsername);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const email = user?.email || "Sin email";

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES")
    : "No disponible";

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error cargando perfil:", error);
        setMessage(`Error cargando perfil: ${error.message}`);
        return;
      }

      const profileUsername = data?.username?.trim() || fallbackUsername;

      setUsername(profileUsername);
      setSavedUsername(profileUsername);
    }

    loadProfile();
  }, [user?.id, fallbackUsername]);

  async function saveProfile(): Promise<void> {
    if (!user?.id) return;

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setMessage("El nombre no puede estar vacío.");
      return;
    }

    if (cleanUsername.length < 3) {
      setMessage("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        username: cleanUsername,
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      console.error("Error actualizando profiles:", profileError);
      setSaving(false);
      setMessage(`Error Supabase: ${profileError.message}`);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        username: cleanUsername,
      },
    });

    if (authError) {
      console.error("Error actualizando auth metadata:", authError);
      setSaving(false);
      setMessage(
        "El nombre se guardó en la base de datos, pero no se pudo actualizar la sesión."
      );
      return;
    }

    await supabase.auth.refreshSession();

    setUsername(cleanUsername);
    setSavedUsername(cleanUsername);
    setEditing(false);
    setSaving(false);
    setMessage("Perfil actualizado correctamente.");
  }

  async function sendPasswordReset(): Promise<void> {
    if (!user?.email) {
      setMessage("No hay email asociado a esta cuenta.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined,
    });

    if (error) {
      setMessage("No se ha podido enviar el email de cambio de contraseña.");
      return;
    }

    setMessage("Te hemos enviado un email para cambiar la contraseña.");
  }

  return (
    <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
          <button
            onClick={onBack}
            className="flex items-center text-left"
            aria-label="Volver al inicio"
          >
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="h-[44px] w-auto object-contain md:h-[52px]"
            />
          </button>

          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 md:text-sm"
          >
            Volver
          </button>
        </div>

        <section className="bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-6 text-white md:px-6">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100 backdrop-blur">
            Cuenta de usuario
          </div>

          <h1 className="mt-3 text-[24px] font-extrabold md:text-[30px]">
            Mi perfil
          </h1>

          <p className="mt-2 max-w-[620px] text-[14px] leading-[1.6] text-blue-100 md:text-[15px]">
            Gestiona tus datos, revisa tu estado Premium y controla la seguridad
            de tu cuenta.
          </p>
        </section>

        <section className="px-4 py-6 md:px-6">
          {message && (
            <div className="mb-4 rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm font-bold text-[#123b86]">
              {message}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[20px] font-extrabold text-[#1f3762]">
                Datos del usuario
              </h2>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="flex flex-col rounded-xl bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-slate-500">Nombre</span>

                  {editing ? (
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2 rounded-lg border border-slate-300 px-3 py-2 font-bold text-[#123b86] outline-none focus:border-[#123b86] sm:mt-0"
                    />
                  ) : (
                    <span className="mt-1 font-bold text-[#123b86] sm:mt-0">
                      {username}
                    </span>
                  )}
                </div>

                <div className="flex flex-col rounded-xl bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-slate-500">Email</span>
                  <span className="mt-1 font-bold text-[#123b86] sm:mt-0">
                    {email}
                  </span>
                </div>

                <div className="flex flex-col rounded-xl bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-slate-500">
                    Fecha de registro
                  </span>
                  <span className="mt-1 font-bold text-[#123b86] sm:mt-0">
                    {createdAt}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="rounded-xl bg-[#123b86] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f3577] disabled:opacity-60"
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>

                    <button
                      onClick={() => {
                        setEditing(false);
                        setUsername(savedUsername);
                        setMessage("");
                      }}
                      disabled={saving}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl bg-[#123b86] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f3577]"
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm">
              <h2 className="text-[20px] font-extrabold text-[#1f3762]">
                Estado Premium
              </h2>

              <div className="mt-5 rounded-[18px] border border-[#dbe7ff] bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Plan actual
                </p>

                <p
                  className={`mt-2 text-[28px] font-extrabold ${
                    hasActiveSubscription ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {hasActiveSubscription ? "Premium activo" : "Plan gratuito"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {hasActiveSubscription
                    ? "Tu acceso Premium está activo. Próximamente aquí verás los días restantes y la fecha de renovación."
                    : "Actualmente no tienes Premium activo. Puedes activarlo para desbloquear simulacros, ranking, panel e insignias."}
                </p>

                <button
                  onClick={() =>
                    alert("Gestión de suscripción próximamente con Stripe.")
                  }
                  className={`mt-5 rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
                    hasActiveSubscription
                      ? "bg-[#123b86] hover:bg-[#0f3577]"
                      : "bg-[#ef4444] hover:bg-[#dc2626]"
                  }`}
                >
                  {hasActiveSubscription
                    ? "Gestionar suscripción"
                    : "Activar Premium"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[20px] font-extrabold text-[#1f3762]">
              Seguridad y cuenta
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <button
                onClick={sendPasswordReset}
                className="rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold text-[#123b86]">
                  Cambiar contraseña
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Te enviaremos un email para actualizar tu clave.
                </p>
              </button>

              <button
                onClick={onLogout}
                className="rounded-2xl border border-slate-200 bg-[#f8fbff] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold text-[#123b86]">Cerrar sesión</p>
                <p className="mt-1 text-sm text-slate-500">
                  Salir de tu cuenta actual.
                </p>
              </button>

              <button
                onClick={() =>
                  alert(
                    "Para eliminar cuentas de forma segura hay que hacerlo con una función protegida de Supabase."
                  )
                }
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-extrabold text-red-600">Eliminar cuenta</p>
                <p className="mt-1 text-sm text-red-500">
                  Acción permanente y no reversible.
                </p>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}