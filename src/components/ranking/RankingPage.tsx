import type { User } from "@supabase/supabase-js";

type RankingRow = {
  user_id: string;
  username: string;
  simulacros_realizados: number;
  media_simulacros: number;
  mejor_simulacro: number;
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

export default function RankingPage({
  user,
  ranking,
  rankingLoading,
  onBack,
}: RankingPageProps) {
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
            Ranking premium
          </div>

          <h1 className="mt-3 text-[24px] font-extrabold md:text-[30px]">
            Top opositores
          </h1>

          <p className="mt-2 max-w-[720px] text-[14px] leading-[1.6] text-blue-100 md:text-[15px]">
            Ranking basado únicamente en simulacros oficiales. Para aparecer en
            el Top necesitas completar al menos 20 simulacros.
          </p>
        </section>

        <section className="px-4 py-6 md:px-6">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Clasificación
              </p>
              <p className="mt-1 text-[24px] font-extrabold text-[#123b86]">
                Top 100
              </p>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Requisito
              </p>
              <p className="mt-1 text-[24px] font-extrabold text-[#123b86]">
                20 simulacros
              </p>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-[#f8fbff] p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Criterio
              </p>
              <p className="mt-1 text-[24px] font-extrabold text-[#123b86]">
                Media global
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[70px_1fr_120px_120px_120px] border-b border-slate-100 bg-[#f8fbff] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.10em] text-slate-500 max-md:hidden">
              <span>Rank</span>
              <span>Usuario</span>
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
                {ranking.map((row, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user?.id === row.user_id;

                  return (
                    <div
                      key={row.user_id}
                      className={`grid items-center gap-3 px-4 py-3 text-sm md:grid-cols-[70px_1fr_120px_120px_120px] ${
                        isCurrentUser ? "bg-[#eef5ff]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                            rank === 1
                              ? "bg-[#fff7d6] text-[#8a6a00]"
                              : rank === 2
                                ? "bg-slate-100 text-slate-600"
                                : rank === 3
                                  ? "bg-[#fff0e6] text-[#9a5b00]"
                                  : "bg-[#eef5ff] text-[#123b86]"
                          }`}
                        >
                          {rank}
                        </span>
                      </div>

                      <div>
                        <p className="font-extrabold text-[#1f3762]">
                          {row.username}
                          {isCurrentUser ? (
                            <span className="ml-2 rounded-full bg-[#123b86] px-2 py-0.5 text-[10px] font-bold text-white">
                              Tú
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-500 md:hidden">
                          Media {formatScore(row.media_simulacros)} / 40 ·{" "}
                          {row.simulacros_realizados} simulacros
                        </p>
                      </div>

                      <div className="hidden text-center font-bold text-[#123b86] md:block">
                        {formatScore(row.media_simulacros)} / 40
                      </div>

                      <div className="hidden text-center font-bold text-[#123b86] md:block">
                        {formatScore(row.mejor_simulacro)} / 40
                      </div>

                      <div className="hidden text-center font-bold text-[#123b86] md:block">
                        {row.simulacros_realizados}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}