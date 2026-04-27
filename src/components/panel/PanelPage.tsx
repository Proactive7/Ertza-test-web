"use client";

import { useEffect, useMemo, useState } from "react";
import PanelTimelineItem from "@/components/ui/PanelTimelineItem";
import PremiumFeature from "@/components/ui/PremiumFeature";
import { getBadgeByPoints } from "@/lib/badges";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";

type PanelPageProps = {
  onBack: () => void;
};

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

type DbTestResult = {
  id: string;
  user_id: string;
  topic_key: string;
  topic_name: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  blank_answers: number;
  passed: boolean;
  points_earned: number;
  created_at: string;
};

type RankingRow = {
  user_id: string;
  username: string;
  simulacros_realizados: number;
  media_simulacros: number;
  mejor_simulacro: number;
};

function formatScore(score: number): string {
  const numericScore = Number(score);
  return Number.isInteger(numericScore)
    ? String(numericScore)
    : numericScore.toFixed(1);
}

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="flex min-h-[138px] flex-col items-center justify-center rounded-[18px] border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-[24px] font-extrabold leading-none text-[#123b86]">
        {value}
      </p>

      {subtitle ? (
        <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function PanelPage({ onBack }: PanelPageProps) {
  const user = useUser();

  const [results, setResults] = useState<DbTestResult[]>([]);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!user) {
        setResults([]);
        setRanking([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: resultsData, error: resultsError } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (resultsError) {
        console.error("Error cargando resultados:", resultsError.message);
        setResults([]);
      } else {
        setResults((resultsData || []) as DbTestResult[]);
      }

      const { data: rankingData, error: rankingError } = await supabase
        .from("simulacro_ranking")
        .select("*")
        .order("media_simulacros", { ascending: false })
        .limit(100);

      if (rankingError) {
        console.error("Error cargando ranking:", rankingError.message);
        setRanking([]);
      } else {
        setRanking((rankingData || []) as RankingRow[]);
      }

      setLoading(false);
    }

    fetchResults();
  }, [user]);

  const averageScore = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((sum, result) => sum + Number(result.score), 0);
    return total / results.length;
  }, [results]);

  const approvedTests = useMemo(() => {
    return results.filter((result) => result.passed).length;
  }, [results]);

  const bestScore = useMemo(() => {
    if (!results.length) return 0;
    return Math.max(...results.map((result) => Number(result.score)));
  }, [results]);

  const currentPoints = useMemo(() => {
    return results.reduce(
      (sum, result) => sum + Number(result.points_earned || 0),
      0
    );
  }, [results]);

  const recentResults = useMemo(() => {
    return results.slice(0, 7);
  }, [results]);

  const mostPlayedTopic = useMemo(() => {
    if (!results.length) return "--";

    const counts: Record<string, number> = {};

    results.forEach((result) => {
      counts[result.topic_name] = (counts[result.topic_name] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "--";
  }, [results]);

  const currentApprovedStreak = useMemo(() => {
    if (!results.length) return 0;

    let streak = 0;

    for (const result of results) {
      if (result.passed) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [results]);

  const bestApprovedStreak = useMemo(() => {
    if (!results.length) return 0;

    let best = 0;
    let current = 0;

    const chronologicalResults = [...results].reverse();

    chronologicalResults.forEach((result) => {
      if (result.passed) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    });

    return best;
  }, [results]);

  const simulacrosRealizados = useMemo(() => {
    return results.filter((result) => result.topic_key === "simulacro").length;
  }, [results]);

  const userRankingPosition = useMemo(() => {
    if (!user) return null;

    const index = ranking.findIndex((row) => row.user_id === user.id);
    return index >= 0 ? index + 1 : null;
  }, [ranking, user]);

  const topOpositoresValue =
    simulacrosRealizados < 20
      ? "Sin clasificar"
      : userRankingPosition
        ? `Rank ${userRankingPosition}`
        : "Sin clasificar";

  const topOpositoresSubtitle =
    simulacrosRealizados < 20 ? `${simulacrosRealizados}/20 simulacros` : "";

  const currentBadge = getBadgeByPoints(currentPoints);

  return (
    <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
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

        <section className="bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-6 text-white md:px-6">
          <h1 className="text-[24px] font-extrabold md:text-[30px]">
            Panel del opositor
          </h1>
        </section>

        <section className="px-4 py-6 md:px-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Nota media"
              value={
                results.length ? `${formatScore(averageScore)} / 40` : "-- / 40"
              }
              subtitle={loading ? "Cargando..." : ""}
            />

            <div className="flex min-h-[138px] flex-col items-center justify-center rounded-[18px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Racha actual de aprobados
              </p>

              <p className="mt-2 text-[24px] font-extrabold leading-none text-[#123b86]">
                {currentApprovedStreak}
              </p>

              <div className="mt-3 rounded-xl border border-[#dbe7ff] bg-[#eef5ff] px-3 py-1.5 text-xs font-bold text-[#123b86]">
                Mejor racha: {bestApprovedStreak}
              </div>
            </div>

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
              title="Top opositores"
              value={topOpositoresValue}
              subtitle={topOpositoresSubtitle}
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-[18px] font-extrabold text-[#1f3762]">
                Actividad reciente
              </h2>

              {loading ? (
                <p className="text-sm text-slate-500">Cargando actividad...</p>
              ) : recentResults.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no has completado ningún test.
                </p>
              ) : (
                <div className="space-y-1">
                  {recentResults.map((result) => (
                    <PanelTimelineItem
                      key={result.id}
                      title={result.topic_name}
                      detail="Último test realizado"
                      result={`${formatScore(Number(result.score))} / 40`}
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
                  <div className="flex justify-between rounded-xl bg-[#f8fbff] px-3 py-2">
                    <span>Mejor nota</span>
                    <span className="font-bold text-[#123b86]">
                      {results.length
                        ? `${formatScore(bestScore)} / 40`
                        : "-- / 40"}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-xl bg-[#f8fbff] px-3 py-2">
                    <span>Tema más practicado</span>
                    <span className="font-bold text-[#123b86]">
                      {mostPlayedTopic}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-xl bg-[#f8fbff] px-3 py-2">
                    <span>Tests superados</span>
                    <span className="font-bold text-[#123b86]">
                      {approvedTests}/{results.length}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-xl bg-[#f8fbff] px-3 py-2">
                    <span>Puntos acumulados</span>
                    <span className="font-bold text-[#123b86]">
                      {currentPoints}
                    </span>
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