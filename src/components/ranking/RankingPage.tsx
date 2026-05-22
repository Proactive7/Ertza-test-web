import type { User } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { getBadgeByPoints } from "@/lib/badges";

type RankingRow = {
  user_id: string;
  username: string;
  simulacros_realizados: number;
  media_simulacros: number;
  mejor_simulacro: number;
  badge_points: number;
};

type RankingPageProps = {
  user: User | null;
  ranking: RankingRow[];
  rankingLoading: boolean;
  onBack: () => void;
};

function formatScore(score: number): string {
  const numericScore = Number(score);
  return Number.isInteger(numericScore)
    ? String(numericScore)
    : numericScore.toFixed(1);
}

function CrownRank({
  rank,
  color,
  stroke,
  laurel,
}: {
  rank: number;
  color: string;
  stroke: string;
  laurel: string;
}) {
  return (
    <div className="relative flex h-[66px] w-[74px] items-center justify-center">
      <svg
        viewBox="0 0 90 76"
        className="h-[66px] w-[74px] drop-shadow-sm"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke={laurel}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        >
          <path d="M25 62 C14 56 9 45 10 35" />
          <path d="M65 62 C76 56 81 45 80 35" />
          <path d="M18 55 C12 55 9 52 7 48" />
          <path d="M16 48 C10 47 8 43 7 39" />
          <path d="M17 41 C12 38 12 34 13 30" />
          <path d="M72 55 C78 55 81 52 83 48" />
          <path d="M74 48 C80 47 82 43 83 39" />
          <path d="M73 41 C78 38 78 34 77 30" />
        </g>

        <path
          d="M22 28 L34 39 L45 15 L56 39 L68 28 L63 53 H27 Z"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <circle cx="22" cy="27" r="4" fill={color} stroke={stroke} strokeWidth="2.5" />
        <circle cx="45" cy="14" r="4" fill={color} stroke={stroke} strokeWidth="2.5" />
        <circle cx="68" cy="27" r="4" fill={color} stroke={stroke} strokeWidth="2.5" />

        <path
          d="M29 53 H61 V60 H29 Z"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <text
          x="45"
          y="48"
          textAnchor="middle"
          fontSize="23"
          fontWeight="900"
          fill="white"
          stroke={stroke}
          strokeWidth="0.6"
        >
          {rank}
        </text>
      </svg>
    </div>
  );
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <CrownRank rank={1} color="#f6b72b" stroke="#d18a00" laurel="#e0a51f" />
    );
  }

  if (rank === 2) {
    return (
      <CrownRank rank={2} color="#c9d1dc" stroke="#8b98a8" laurel="#9aa6b5" />
    );
  }

  if (rank === 3) {
    return (
      <CrownRank rank={3} color="#c97938" stroke="#9a4f1f" laurel="#b8612d" />
    );
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9ec5ff] bg-[#eef5ff] text-sm font-extrabold text-[#123b86] shadow-sm">
      {rank}
    </span>
  );
}

export default function RankingPage({
  user,
  ranking,
  rankingLoading,
  onBack,
}: RankingPageProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(ranking.length / itemsPerPage);

  const paginatedRanking = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    return ranking.slice(start, end);
  }, [ranking, currentPage]);

  function goToPage(page: number): void {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-7 text-white md:px-6">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100 backdrop-blur">
            Ranking premium
          </div>

          <h1 className="mt-4 text-[28px] font-extrabold md:text-[34px]">
            Top opositores
          </h1>

          <p className="mt-2 max-w-[720px] text-[14px] leading-[1.7] text-blue-100 md:text-[15px]">
            Ranking basado únicamente en simulacros oficiales. Para aparecer en
            el Top necesitas completar al menos 20 simulacros.
          </p>

          <div className="pointer-events-none absolute right-8 top-4 hidden text-[130px] opacity-10 md:block">
            🏆
          </div>
        </section>

        <section className="px-4 py-6 md:px-6">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[16px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Clasificación
              </p>
              <p className="mt-1 text-[25px] font-extrabold text-[#123b86]">
                Top 100
              </p>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Requisito
              </p>
              <p className="mt-1 text-[25px] font-extrabold text-[#123b86]">
                20 simulacros
              </p>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-[#f8fbff] p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Criterio
              </p>
              <p className="mt-1 text-[25px] font-extrabold text-[#123b86]">
                Media global
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[105px_1.2fr_1.2fr_1fr_1fr_1fr] items-center border-b border-slate-100 bg-[#f8fbff] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500 md:grid">
              <span className="text-center">Rank</span>
              <span className="text-center">Usuario</span>
              <span className="text-center">Insignia</span>
              <span className="text-center">Media</span>
              <span className="text-center">Mejor</span>
              <span className="text-center">Simulacros</span>
            </div>

            {rankingLoading ? (
              <div className="p-6 text-center text-sm font-semibold text-slate-500">
                Cargando ranking...
              </div>
            ) : ranking.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-bold text-[#123b86]">
                  Todavía no hay opositores clasificados.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  El ranking aparecerá cuando haya usuarios con al menos 20
                  simulacros completados.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paginatedRanking.map((row, index) => {
                  const rank = (currentPage - 1) * itemsPerPage + index + 1;
                  const isCurrentUser = user?.id === row.user_id;
                  const badge = getBadgeByPoints(Number(row.badge_points || 0));

                  return (
                    <div
                      key={row.user_id}
                      className={`grid items-center gap-3 px-4 py-4 text-sm md:grid-cols-[105px_1.2fr_1.2fr_1fr_1fr_1fr] ${
                        isCurrentUser ? "bg-[#eef5ff]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {getRankBadge(rank)}
                      </div>

                      <div className="text-center">
                        <p className="font-extrabold text-[#1f3762]">
                          {row.username}
                          {isCurrentUser ? (
                            <span className="ml-2 rounded-full bg-[#123b86] px-2 py-0.5 text-[10px] font-bold text-white">
                              Tú
                            </span>
                          ) : null}
                        </p>

                        <div className="mt-2 flex items-center justify-center gap-2 md:hidden">
                          <img
                            src={badge.icon}
                            alt={badge.name}
                            className="h-7 w-7 object-contain"
                          />
                          <span className="text-xs font-bold text-slate-500">
                            {badge.name}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500 md:hidden">
                          Media {formatScore(row.media_simulacros)} / 40 · Mejor{" "}
                          {formatScore(row.mejor_simulacro)} / 40 ·{" "}
                          {row.simulacros_realizados} simulacros
                        </p>
                      </div>

                      <div className="hidden flex-col items-center justify-center md:flex">
                        <img
                          src={badge.icon}
                          alt={badge.name}
                          className="h-9 w-9 object-contain"
                        />
                        <span className="mt-1 text-xs font-bold text-[#1f3762]">
                          {badge.name}
                        </span>
                      </div>

                      <div className="hidden text-center font-extrabold text-[#123b86] md:block">
                        {formatScore(row.media_simulacros)} / 40
                      </div>

                      <div className="hidden text-center font-extrabold text-[#123b86] md:block">
                        {formatScore(row.mejor_simulacro)} / 40
                      </div>

                      <div className="hidden text-center font-extrabold text-[#123b86] md:block">
                        {row.simulacros_realizados}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {totalPages > 1 && !rankingLoading && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`h-10 w-10 rounded-xl text-sm font-extrabold transition ${
                      currentPage === page
                        ? "bg-[#123b86] text-white shadow-lg"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}