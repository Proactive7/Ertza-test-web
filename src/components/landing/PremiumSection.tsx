"use client";

import Benefit from "@/components/ui/Benefit";
import PremiumCard from "@/components/ui/PremiumCard";

type Props = {
  isLoggedIn?: boolean;
  hasActiveSubscription?: boolean;
  trialUsed?: boolean;
  onOpenCheckout?: () => void | Promise<void>;
};

export default function PremiumSection({
  isLoggedIn = false,
  hasActiveSubscription = false,
  trialUsed = false,
  onOpenCheckout,
}: Props) {
  const canUseTrial = !trialUsed;
  const ctaText = canUseTrial ? "Probar 7 días gratis" : "Hazte Premium";
  const badgeText = canUseTrial ? "7 días gratis" : "Premium";
  const eyebrowText = canUseTrial
    ? "Prueba gratuita Premium"
    : "Servicio Premium";
  const titleText = canUseTrial
    ? "Premium gratis durante 7 días"
    : "Premium para preparar tu oposición";
  const descriptionText = canUseTrial
    ? "Accede a todas las herramientas Premium durante 7 días sin pagar. Después, la suscripción continúa por 9,99 € al mes. Puedes cancelar la renovación en cualquier momento desde tu perfil."
    : "Accede a todas las herramientas Premium por 9,99 € al mes. Puedes cancelar la renovación en cualquier momento desde tu perfil.";

  function handleClick(): void {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (hasActiveSubscription) return;

    if (onOpenCheckout) {
      void onOpenCheckout();
    }
  }

  return (
    <section className="border-t border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f5fb_100%)] px-3 py-6 sm:px-6 sm:py-10 md:px-8 lg:px-10">
      <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="rounded-[24px] border border-[#dbe7ff] bg-white p-4 shadow-[0_18px_50px_rgba(37,99,235,0.08)] sm:rounded-[28px] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-[#e8f1ff] px-3 py-1 text-xs font-bold text-[#2156b4] sm:text-sm">
              {badgeText}
            </div>

            <div className="rounded-full bg-[#0f3577] px-3 py-1 text-xs font-extrabold text-white sm:hidden">
              9,99 €/mes
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <PremiumCard title="Preparación" value="Exámenes" />
            <PremiumCard title="Errores" value="Corrección" />
            <PremiumCard title="Progreso" value="Estadísticas" />
            <PremiumCard title="Ranking" value="Top opositores" />
          </div>

          <div className="mt-4 rounded-2xl bg-[#0f3577] p-4 text-white sm:mt-6 sm:p-5">
            <p className="text-sm font-semibold text-blue-100">
              Qué desbloquea Premium
            </p>

            <div className="mt-3 grid gap-2 text-sm text-blue-50 sm:grid-cols-2">
              <span>• Simulacros oficiales</span>
              <span>• Corrección de preguntas</span>
              <span>• Ranking premium</span>
              <span>• Estadísticas por tema</span>
              <span>• Rachas de aprobados</span>
              <span>• Evolución de resultados</span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#2156b4] sm:mb-3 sm:text-sm sm:tracking-[0.22em]">
            {eyebrowText}
          </p>

          <h2 className="mb-3 text-[28px] font-extrabold leading-[1.08] text-[#2a3445] sm:mb-5 sm:text-[36px] md:text-[50px]">
            Prueba ErtzaTest
            <br />
            {titleText}
          </h2>

          <p className="mb-5 max-w-[640px] text-[14px] leading-[1.65] text-slate-500 sm:mb-7 sm:text-[18px] md:text-[20px]">
            {descriptionText}
          </p>

          <div className="mb-5 grid gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-3">
            <Benefit text="Simulacros de examen completos" />
            <Benefit text="Revisión inteligente de errores" />
            <Benefit text="Ranking de opositores" />
            <Benefit text="Estadísticas detalladas" />
            <Benefit text="Rachas de tests aprobados" />
            <Benefit text="Media de resultados" />
            <Benefit text="Acceso inmediato a Premium" />
            {canUseTrial ? <Benefit text="7 días de Premium gratis" /> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-stretch sm:gap-4">
            {isLoggedIn && hasActiveSubscription ? (
              <div className="flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-6 py-3.5 text-sm font-bold text-green-700 sm:px-7 sm:py-4 sm:text-base">
                Suscripción activa ✅
              </div>
            ) : (
              <button
                onClick={handleClick}
                className="rounded-xl bg-[#ef4444] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(239,68,68,0.28)] transition hover:bg-[#dc2626] sm:px-7 sm:py-4 sm:text-base"
              >
                {ctaText}
              </button>
            )}

            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-sm font-semibold text-slate-600 shadow-sm sm:justify-self-end sm:px-5 sm:py-4">
              <span>
                {canUseTrial ? "7 días gratis · después " : "Suscripción "}
                <span className="font-black text-[#123b86]">9,99 €/mes</span>
              </span>
            </div>

            {!hasActiveSubscription ? (
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500 sm:col-span-2 sm:text-xs">
                {canUseTrial
                  ? "Necesitas añadir un método de pago para activar la prueba. No se cobrará nada hasta que finalicen los 7 días gratuitos."
                  : "La prueba gratuita ya fue utilizada. Puedes activar Premium por 9,99 €/mes y cancelar la renovación cuando quieras."}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}