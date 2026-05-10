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
    <section className="border-t border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f5fb_100%)] px-6 py-12 md:px-8 lg:px-10">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        {/* IZQUIERDA */}
        <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
          <div className="mb-5 inline-flex rounded-full bg-[#e8f1ff] px-3 py-1 text-sm font-bold text-[#2156b4]">
            {badgeText}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PremiumCard title="Preparación real" value="Exámenes oficiales" />
            <PremiumCard title="Mejora continua" value="Detecta tus errores" />
            <PremiumCard
              title="Seguimiento claro"
              value="Visualiza tu progreso"
            />
            <PremiumCard
              title="Ventaja competitiva"
              value="Las mejores herramientas"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-[#0f3577] p-5 text-white">
            <p className="text-sm font-semibold text-blue-100">
              Qué desbloquea Premium
            </p>
            <ul className="mt-3 space-y-2 text-sm text-blue-50">
              <li>• Simulacros de examen oficiales</li>
              <li>• Corrección de preguntas</li>
              <li>• Ranking con mínimo de 20 tests</li>
              <li>• Estadísticas avanzadas por tema</li>
              <li>• Rachas de tests aprobados</li>
              <li>• Media de resultados y evolución</li>
            </ul>
          </div>
        </div>

        {/* DERECHA */}
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#2156b4]">
            {eyebrowText}
          </p>

          <h2 className="mb-5 text-[36px] font-extrabold leading-[1.15] text-[#2a3445] md:text-[50px]">
            Prueba ErtzaTest
            <br />
            {titleText}
          </h2>

          <p className="mb-7 max-w-[640px] text-[18px] leading-[1.7] text-slate-500 md:text-[20px]">
            {descriptionText}
          </p>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <Benefit text="Simulacros de examen completos" />
            <Benefit text="Revisión inteligente de errores" />
            <Benefit text="Ranking de opositores" />
            <Benefit text="Estadísticas detalladas" />
            <Benefit text="Rachas de tests aprobados" />
            <Benefit text="Media de resultados" />
            <Benefit text="Acceso inmediato a todas las ventajas premium" />
            {canUseTrial ? <Benefit text="7 días de Premium gratis" /> : null}
          </div>

          {/* BOTÓN INTELIGENTE */}
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-stretch">
            {isLoggedIn && hasActiveSubscription ? (
              <div className="flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-7 py-4 text-base font-bold text-green-700">
                Suscripción activa ✅
              </div>
            ) : (
              <button
                onClick={handleClick}
                className="rounded-xl bg-[#ef4444] px-7 py-4 text-base font-bold text-white shadow-[0_16px_30px_rgba(239,68,68,0.28)] transition hover:bg-[#dc2626]"
              >
                {ctaText}
              </button>
            )}

            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-600 shadow-sm sm:justify-self-end">
              <span>
                {canUseTrial ? "7 días gratis · después " : "Suscripción "}
                <span className="font-black text-[#123b86]">9,99 €/mes</span>
              </span>
            </div>

            {!hasActiveSubscription ? (
              <p className="text-xs font-semibold leading-relaxed text-slate-500 sm:col-span-2">
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