"use client";

import { useMemo } from "react";
import PanelTimelineItem from "@/components/ui/PanelTimelineItem";
import PremiumFeature from "@/components/ui/PremiumFeature";
import { USER_POINTS_KEY, getBadgeByPoints } from "@/lib/badges";
import {
  getApprovedTestsCount,
  getAverageScore,
  getBestScore,
  getCurrentStreak,
  getMostPlayedTopic,
  getRecentResults,
  getStoredResults,
} from "@/lib/stats";

type PanelPageProps = {
  onBack: () => void;
};

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="flex min-h-[138px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-[24px] font-extrabold leading-none text-[#123b86]">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function PanelPage({ onBack }: PanelPageProps) {
  const results = useMemo(() => getStoredResults(), []);
  const currentPoints = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const saved = Number(window.localStorage.getItem(USER_POINTS_KEY) || "0");
    return Number.isNaN(saved) ? 0 : saved;
  }, []);

  const averageScore = getAverageScore(results);
  const approvedTests = getApprovedTestsCount(results);
  const currentStreak = getCurrentStreak(results);
  const bestScore = getBestScore(results);
  const recentResults = getRecentResults(results, 5);
  const mostPlayedTopic = getMostPlayedTopic(results);
  const currentBadge = getBadgeByPoints(currentPoints);

  return (
    <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
          <button onClick={onBack}>
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="h-[44px] md:h-[52px]"
            />
          </button>

          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Volver
          </button>
        </div>

        {/* HERO */}
        <section className="bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-6 text-white md:px-6">
          <h1 className="text-[24px] font-extrabold md:text-[30px]">
            Panel del opositor
          </h1>
        </section>

        {/* STATS */}
        <section className="px-4 py-6 md:px-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            
            <StatCard
              title="Nota media"
              value={results.length ? `${averageScore.toFixed(1)} / 40` : "-- / 40"}
              subtitle=""
            />

            <StatCard
              title="Racha actual"
              value={`${currentStreak} días`}
              subtitle=""
            />

            {/* INSIGNIA */}
            <div className="flex min-h-[138px] flex-col items-center justify-center rounded-[18px] border border-[#dbe7ff] bg-[#f8fbff] p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Insignia actual
              </p>

              <img
                src={currentBadge.icon}
                alt={currentBadge.name}
                className="mt-2 h-12 w-12 object-contain"
              />

              <p className="mt-2 text-[20px] font-extrabold text-[#123b86]">
                {currentBadge.name}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {currentPoints} puntos
              </p>
            </div>

            <StatCard
              title="Exámenes superados"
              value={String(approvedTests)}
              subtitle=""
            />
          </div>

          {/* RESTO IGUAL */}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-[18px] font-extrabold text-[#1f3762]">
                Actividad reciente
              </h2>

              {recentResults.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no has completado ningún test.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentResults.map((result) => (
                    <PanelTimelineItem
                      key={result.id}
                      title={result.topicName}
                      detail="Último test realizado"
                      result={`${result.score.toFixed(1)} / 40`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-[18px] font-extrabold text-[#1f3762]">
                  Resumen de rendimiento
                </h2>

                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between bg-[#f8fbff] px-3 py-2 rounded-xl">
                    <span>Mejor nota</span>
                    <span className="font-bold text-[#123b86]">
                      {results.length ? `${bestScore.toFixed(1)} / 40` : "-- / 40"}
                    </span>
                  </div>

                  <div className="flex justify-between bg-[#f8fbff] px-3 py-2 rounded-xl">
                    <span>Tema más practicado</span>
                    <span className="font-bold text-[#123b86]">{mostPlayedTopic}</span>
                  </div>

                  <div className="flex justify-between bg-[#f8fbff] px-3 py-2 rounded-xl">
                    <span>Tests realizados</span>
                    <span className="font-bold text-[#123b86]">{results.length}</span>
                  </div>

                  <div className="flex justify-between bg-[#f8fbff] px-3 py-2 rounded-xl">
                    <span>Puntos acumulados</span>
                    <span className="font-bold text-[#123b86]">{currentPoints}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] border border-slate-200 bg-[#f8fbff] p-4 shadow-sm">
                <h2 className="mb-4 text-[18px] font-extrabold text-[#1f3762]">
                  Funciones premium
                </h2>

                <div className="space-y-2.5 text-sm text-slate-700">
                  <PremiumFeature text="Simulacros de examen completos" />
                  <PremiumFeature text="Corrección inteligente de errores" />
                  <PremiumFeature text="Ranking de opositores" />
                  <PremiumFeature text="Estadísticas avanzadas por tema" />
                  <PremiumFeature text="Rachas de tests aprobados" />
                  <PremiumFeature text="Media de resultados" />
                  <PremiumFeature text="Historial de actividad" />
                  <PremiumFeature text="Sistema de insignias" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}