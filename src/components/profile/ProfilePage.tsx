"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ProfilePageProps = {
  user: User | null;
  hasActiveSubscription: boolean;
  trialUsed?: boolean;
  onBack: () => void;
  onLogout: () => void | Promise<void>;
  onOpenCheckout?: () => void | Promise<void>;
};

type PremiumProfileData = {
  premium_until: string | null;
  cancel_at_period_end: boolean | null;
  stripe_subscription_status: string | null;
  trial_used: boolean | null;
};

export default function ProfilePage({
  user,
  hasActiveSubscription,
  trialUsed = false,
  onBack,
  onLogout,
  onOpenCheckout,
}: ProfilePageProps) {
  const fallbackUsername = user?.email?.split("@")[0] || "Usuario";

  const [username, setUsername] = useState(fallbackUsername);
  const [savedUsername, setSavedUsername] = useState(fallbackUsername);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [premiumProfile, setPremiumProfile] = useState<PremiumProfileData>({
    premium_until: null,
    cancel_at_period_end: false,
    stripe_subscription_status: null,
    trial_used: trialUsed,
  });

  const email = user?.email || "Sin email";

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES")
    : "No disponible";

  const effectiveTrialUsed = Boolean(
    premiumProfile.trial_used || trialUsed
  );

  const isTrialing =
    hasActiveSubscription &&
    premiumProfile.stripe_subscription_status === "trialing";

  const premiumUntilDate = useMemo(() => {
    if (!premiumProfile.premium_until) return null;

    const date = new Date(premiumProfile.premium_until);

    return Number.isNaN(date.getTime()) ? null : date;
  }, [premiumProfile.premium_until]);

  const premiumUntilText = premiumUntilDate
    ? premiumUntilDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "No disponible";

  const premiumDaysRemaining = useMemo(() => {
    if (!premiumUntilDate) return null;

    const diffMs = premiumUntilDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
  }, [premiumUntilDate]);

  const planTitle = hasActiveSubscription
    ? isTrialing
      ? "Prueba gratuita activa"
      : "Premium activo"
    : "Plan gratuito";

  const renewalLabel = isTrialing
    ? "Fin de la prueba gratuita"
    : premiumProfile.cancel_at_period_end
      ? "Premium activo hasta"
      : "Próxima renovación";

  const inactiveDescription = effectiveTrialUsed
    ? "Ya has utilizado la prueba gratuita. Puedes activar Premium por 9,99 €/mes para desbloquear simulacros, ranking, panel e insignias."
    : "Puedes probar Premium gratis durante 7 días. No se cobrará nada hasta que termine la prueba gratuita.";

  const premiumButtonText = premiumLoading
    ? "Abriendo..."
    : hasActiveSubscription
      ? "Gestionar suscripción"
      : effectiveTrialUsed
        ? "Activar Premium"
        : "Probar 7 días gratis";

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "username, premium_until, cancel_at_period_end, stripe_subscription_status, trial_used"
        )
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

      setPremiumProfile({
        premium_until: data?.premium_until || null,
        cancel_at_period_end: Boolean(data?.cancel_at_period_end),
        stripe_subscription_status: data?.stripe_subscription_status || null,
        trial_used: Boolean(data?.trial_used),
      });
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

  async function openStripePortal(): Promise<void> {
    setPremiumLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
      setPremiumLoading(false);
      setMessage("No se pudo validar tu sesión. Vuelve a iniciar sesión.");
      return;
    }

    const response = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });

    const portalData = await response.json();

    setPremiumLoading(false);

    if (!response.ok || !portalData?.url) {
      console.error("Error abriendo Stripe Portal:", portalData);
      setMessage(
        portalData?.error ||
          "No se pudo abrir la gestión de suscripción. Inténtalo de nuevo."
      );
      return;
    }

    window.location.href = portalData.url;
  }

  async function handlePremiumButton(): Promise<void> {
    if (premiumLoading) return;

    if (hasActiveSubscription) {
      await openStripePortal();
      return;
    }

    if (onOpenCheckout) {
      setPremiumLoading(true);
      await onOpenCheckout();
      setPremiumLoading(false);
    }
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
                    hasActiveSubscription
                      ? isTrialing
                        ? "text-[#123b86]"
                        : "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {planTitle}
                </p>

                {hasActiveSubscription ? (
                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-[#123b86]">
                      <p className="font-bold">
                        {renewalLabel}: {premiumUntilText}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Días restantes:{" "}
                        {premiumDaysRemaining !== null
                          ? premiumDaysRemaining
                          : "No disponible"}
                      </p>
                    </div>

                    {isTrialing ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
                        <p className="font-bold">
                          Estás disfrutando de la prueba gratuita de 7 días.
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          No se cobrará nada hasta que finalice la prueba.
                        </p>
                      </div>
                    ) : null}

                    {premiumProfile.cancel_at_period_end ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                        <p className="font-bold">Renovación cancelada</p>
                        <p className="mt-1 text-xs font-semibold">
                          Mantendrás Premium hasta el final del periodo pagado.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-500">
                    <p>{inactiveDescription}</p>

                    {!effectiveTrialUsed ? (
                      <p className="mt-2 font-bold text-[#123b86]">
                        7 días gratis · después 9,99 €/mes
                      </p>
                    ) : (
                      <p className="mt-2 font-bold text-[#123b86]">
                        Suscripción Premium: 9,99 €/mes
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handlePremiumButton}
                  disabled={premiumLoading}
                  className={`mt-5 rounded-xl px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    hasActiveSubscription
                      ? "bg-[#123b86] hover:bg-[#0f3577]"
                      : "bg-[#ef4444] hover:bg-[#dc2626]"
                  }`}
                >
                  {premiumButtonText}
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