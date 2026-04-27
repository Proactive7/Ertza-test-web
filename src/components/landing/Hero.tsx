"use client";

import { motion } from "framer-motion";
import HeroDashboard from "@/components/landing/HeroDashboard";
import MetricCard from "@/components/ui/MetricCard";
import { useVisitsCounter } from "@/hooks/useVisitsCounter";
import { formatVisits } from "@/lib/formatVisits";

type HeroProps = {
  onOpenTopics: () => void;
  onOpenPremium: () => void;
};

const chartPoints = [
  "0,34 18,28 36,30 54,20 72,22 90,14 108,16 126,8",
  "0,36 18,26 36,28 54,18 72,20 90,12 108,14 126,6",
  "0,35 18,27 36,24 54,19 72,16 90,13 108,10 126,5",
];

export default function Hero({ onOpenTopics, onOpenPremium }: HeroProps) {
  const visits = useVisitsCounter();

  return (
    <section className="relative overflow-hidden px-6 pb-10 pt-2 md:px-8 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_top_right,rgba(93,134,209,0.35),transparent_25%),radial-gradient(circle_at_left_top,rgba(18,59,134,0.12),transparent_28%)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-8 py-6 text-white shadow-[0_28px_70px_rgba(15,53,119,0.28)] md:px-10 md:py-8 lg:px-12"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 bottom-0 h-48 w-72 rounded-full bg-white/6 blur-2xl" />
          <div className="absolute right-8 top-10 h-28 w-28 rounded-full border border-white/20" />
          <div className="absolute left-[48%] top-20 h-4 w-4 rounded-full bg-white/20" />
          <div className="absolute right-[7%] top-[15%] text-2xl text-white/20">♥</div>
          <div className="absolute right-[10%] bottom-[12%] text-xl text-white/20">♥</div>
        </div>

        <div className="relative grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-[590px] mt-2 md:mt-4 lg:mt-6">
            <div className="-mt-1 mb-5 inline-flex items-center gap-4 rounded-[18px] border border-white/20 bg-white/10 px-5 py-3 text-white shadow backdrop-blur-md">
              <span className="text-[20px]">👁️</span>

              <div className="flex flex-col">
                <span className="text-[18px] font-extrabold md:text-[20px]">
                  {formatVisits(visits)} visitas
                </span>
                <span className="text-xs text-blue-100/80">
                  actividad en directo
                </span>
              </div>

              <svg width="110" height="36" viewBox="0 0 128 42" fill="none">
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

            <h1 className="mb-5 text-[40px] font-extrabold leading-[1.04] md:text-[56px] lg:text-[64px]">
              Prepara tus oposiciones
              <br />
              a la Ertzaintza
            </h1>

            <p className="mb-7 text-[18px] text-blue-100 md:text-[21px]">
              Accede a test gratuitos por tema y mejora tu preparación con una
              plataforma clara y profesional.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onOpenTopics}
                className="rounded-xl bg-[#ef4444] px-7 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#dc2626]"
              >
                Empieza tu preparación
              </button>

              <button
                onClick={onOpenPremium}
                className="rounded-xl bg-[#ef4444] px-7 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#dc2626]"
              >
                Ventajas premium
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetricCard number="Temario" label="Contenido actualizado" />
              <MetricCard number="9,99 €" label="Premium mensual" />
              <MetricCard number="40" label="Preguntas por test" />
              <MetricCard
                number="+1 / -0,3"
                label="Sistema de puntuación"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 text-lg font-semibold text-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span>Acceso inmediato a todas las ventajas premium</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span>Invierte bien tu tiempo con las mejores herramientas</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-400">✔</span>
                <span>Mejora tu rendimiento desde el primer test</span>
              </div>
            </div>
          </div>

          <HeroDashboard />
        </div>
      </motion.div>
    </section>
  );
}