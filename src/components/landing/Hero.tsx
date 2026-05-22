"use client";

import { motion } from "framer-motion";
import HeroDashboard from "@/components/landing/HeroDashboard";
import MetricCard from "@/components/ui/MetricCard";
import { useVisitsCounter } from "@/hooks/useVisitsCounter";
import { formatVisits } from "@/lib/formatVisits";

type HeroProps = {
  onOpenTopics: () => void;
  onOpenPremium: () => void;
  isLoggedIn?: boolean;
};

const chartPoints = [
  "0,34 18,28 36,30 54,20 72,22 90,14 108,16 126,8",
  "0,36 18,26 36,28 54,18 72,20 90,12 108,14 126,6",
  "0,35 18,27 36,24 54,19 72,16 90,13 108,10 126,5",
];

export default function Hero({
  onOpenTopics,
  onOpenPremium,
  isLoggedIn = false,
}: HeroProps) {
  const visits = useVisitsCounter();

  function handleStartPreparation(): void {
    if (isLoggedIn) {
      onOpenTopics();
      return;
    }

    window.location.href = "/login";
  }

  return (
    <section className="relative overflow-hidden px-3 pb-5 pt-2 sm:px-6 md:px-8 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_right,rgba(93,134,209,0.35),transparent_25%),radial-gradient(circle_at_left_top,rgba(18,59,134,0.12),transparent_28%)] md:h-[560px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-5 text-white shadow-[0_22px_55px_rgba(15,53,119,0.22)] sm:px-6 md:rounded-[28px] md:px-10 md:py-8 lg:px-12"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 bottom-0 h-48 w-72 rounded-full bg-white/6 blur-2xl" />
          <div className="absolute right-8 top-10 hidden h-28 w-28 rounded-full border border-white/20 sm:block" />
          <div className="absolute left-[48%] top-20 hidden h-4 w-4 rounded-full bg-white/20 sm:block" />
        </div>

        <div className="relative grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="mt-0 max-w-[590px] md:mt-4 lg:mt-6">
            <div className="mb-4 flex w-full items-center justify-between gap-3 rounded-[16px] border border-white/20 bg-white/10 px-3 py-2.5 text-white shadow backdrop-blur-md sm:mb-5 sm:inline-flex sm:w-auto sm:justify-start sm:gap-4 sm:px-5 sm:py-3">
              <span className="text-[18px] sm:text-[20px]">👁️</span>

              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-extrabold sm:text-[18px] md:text-[20px]">
                  {formatVisits(visits)} visitas
                </span>
                <span className="text-[11px] text-blue-100/80 sm:text-xs">
                  actividad en directo
                </span>
              </div>

              <svg
                width="78"
                height="28"
                viewBox="0 0 128 42"
                fill="none"
                className="shrink-0 sm:w-[110px]"
              >
                {chartPoints.map((points, i) => (
                  <motion.polyline
                    key={i}
                    points={points}
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: i * 0.15 }}
                  />
                ))}
              </svg>
            </div>

            <h1 className="mb-3 text-[28px] font-extrabold leading-[1.05] sm:mb-5 sm:text-[40px] md:text-[56px] lg:text-[64px]">
              Prepara tus oposiciones
              <br className="hidden sm:block" />
              <span className="block sm:ml-2 sm:inline">
                a la Ertzaintza
              </span>
            </h1>

            <p className="mb-5 max-w-[560px] text-[14px] leading-relaxed text-blue-100 sm:mb-7 sm:text-[18px] md:text-[21px]">
              Test gratuitos por tema, simulacros oficiales y seguimiento de tu
              progreso en una plataforma clara y profesional.
            </p>

            <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:gap-4">
              <button
                onClick={handleStartPreparation}
                className="w-full rounded-xl bg-[#ef4444] px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#dc2626] sm:w-auto sm:px-7 sm:py-4 sm:text-base"
              >
                Empieza tu preparación
              </button>

              <button
                onClick={onOpenPremium}
                className="w-full rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto sm:border-0 sm:bg-[#ef4444] sm:px-7 sm:py-4 sm:text-base sm:hover:bg-[#dc2626]"
              >
                Ventajas premium
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-4">
              <MetricCard number="Temario" label="Actualizado" />
              <MetricCard number="9,99 €" label="Premium mensual" />
              <MetricCard number="40" label="Preguntas por test" />
              <MetricCard number="+1 / -0,3" label="Puntuación" />
            </div>

            <div className="mt-5 grid gap-2.5 rounded-[18px] border border-white/15 bg-white/10 p-3 text-[13px] font-semibold text-blue-100 backdrop-blur sm:mt-8 sm:bg-transparent sm:p-0 sm:text-lg md:border-0">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-green-400">✔</span>
                <span>Acceso inmediato a ventajas premium</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-green-400">✔</span>
                <span>Mejora tu rendimiento desde el primer test</span>
              </div>

              <div className="hidden items-start gap-2 sm:flex">
                <span className="mt-0.5 text-green-400">✔</span>
                <span>Invierte bien tu tiempo con las mejores herramientas</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:block">
            <div className="mt-1 sm:mt-0">
              <HeroDashboard />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}