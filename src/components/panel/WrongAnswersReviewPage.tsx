"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";
import { OptionKey, TopicKey } from "@/types/quiz";

type WrongAnswersReviewPageProps = {
  onBack: () => void;
};

type WrongAnswerSummary = {
  user_id: string;
  question_id: string;
  topic_key: TopicKey;
  topic_name: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionKey;
  times_wrong: number;
  last_wrong_at: string;
  last_selected_option: OptionKey | null;
};

const PAGE_SIZE = 10;

function formatDate(dateISO: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateISO));
}

function getOptionText(answer: WrongAnswerSummary, option: OptionKey): string {
  if (option === "a") return answer.option_a;
  if (option === "b") return answer.option_b;
  if (option === "c") return answer.option_c;
  return answer.option_d;
}

function getOptionClass(answer: WrongAnswerSummary, option: OptionKey): string {
  const isSelected = answer.last_selected_option === option;
  const isCorrect = answer.correct_option === option;

  const base =
    "rounded-[14px] border px-4 py-3 text-left text-[15px] leading-snug transition";

  if (isSelected && isCorrect) {
    return `${base} border-green-500 bg-green-100 text-green-900`;
  }

  if (isSelected && !isCorrect) {
    return `${base} border-red-500 bg-red-100 text-red-900`;
  }

  if (isCorrect) {
    return `${base} border-green-500 bg-green-50 text-green-900`;
  }

  return `${base} border-[#dbe3ef] bg-white text-slate-700`;
}

export default function WrongAnswersReviewPage({
  onBack,
}: WrongAnswersReviewPageProps) {
  const { user, loading: userLoading } = useUser();

  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchWrongAnswers() {
      if (userLoading) return;

      if (!user?.id) {
        setWrongAnswers([]);
        setPage(1);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("wrong_answers_summary")
        .select("*")
        .eq("user_id", user.id)
        .order("times_wrong", { ascending: false })
        .order("last_wrong_at", { ascending: false });

      if (error) {
        console.error("Error cargando repaso de fallos:", error.message);
        setWrongAnswers([]);
      } else {
        setWrongAnswers((data || []) as WrongAnswerSummary[]);
      }

      setPage(1);
      setLoading(false);
    }

    void fetchWrongAnswers();
  }, [user?.id, userLoading]);

  const totalPages = Math.max(1, Math.ceil(wrongAnswers.length / PAGE_SIZE));

  const currentPageAnswers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return wrongAnswers.slice(start, start + PAGE_SIZE);
  }, [wrongAnswers, page]);

  const totalTimesWrong = useMemo(() => {
    return wrongAnswers.reduce(
      (sum, answer) => sum + Number(answer.times_wrong || 0),
      0
    );
  }, [wrongAnswers]);

  function goPreviousPage(): void {
    setPage((current) => Math.max(1, current - 1));

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goNextPage(): void {
    setPage((current) => Math.min(totalPages, current + 1));

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (loading || userLoading) {
    return (
      <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
        <div className="mx-auto max-w-[950px] rounded-[20px] border border-white/60 bg-white p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
          <p className="text-sm font-bold text-[#123b86]">
            Cargando repaso inteligente...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto max-w-[950px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
          <button onClick={onBack}>
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="h-[44px] w-auto object-contain md:h-[52px]"
            />
          </button>

          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Volver al panel
          </button>
        </div>

        <section className="bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-6 text-white md:px-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">
            Repaso inteligente
          </p>

          <h1 className="mt-2 text-[24px] font-extrabold md:text-[30px]">
            Preguntas falladas
          </h1>

          <p className="mt-2 max-w-[720px] text-sm leading-relaxed text-blue-100">
            Repasa primero las preguntas que más veces has fallado y refuerza tus
            puntos débiles.
          </p>
        </section>

        <section className="px-4 py-6 md:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-[#dbe7ff] bg-[#f8fbff] p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Preguntas únicas
              </p>

              <p className="mt-2 text-[28px] font-extrabold text-[#123b86]">
                {wrongAnswers.length}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#dbe7ff] bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Fallos acumulados
              </p>

              <p className="mt-2 text-[28px] font-extrabold text-red-500">
                {totalTimesWrong}
              </p>
            </div>

            <div className="rounded-[18px] border border-[#dbe7ff] bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Página
              </p>

              <p className="mt-2 text-[28px] font-extrabold text-[#123b86]">
                {page}/{totalPages}
              </p>
            </div>
          </div>

          {wrongAnswers.length === 0 ? (
            <div className="mt-5 rounded-[18px] border border-green-200 bg-green-50 p-5 text-green-900">
              <p className="text-lg font-bold">
                Todavía no tienes preguntas falladas para repasar.
              </p>

              <p className="mt-1 text-sm">
                Cuando completes tests y falles preguntas, aparecerán aquí para
                que puedas repasarlas.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-4">
                {currentPageAnswers.map((answer, index) => (
                  <div
                    key={`${answer.question_id}-${answer.topic_key}`}
                    className="rounded-[22px] border border-[#d9e7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6a7a99]">
                        Pregunta {(page - 1) * PAGE_SIZE + index + 1}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-black text-[#123b86]">
                          {answer.topic_name}
                        </span>

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                          Fallada {answer.times_wrong}{" "}
                          {answer.times_wrong === 1 ? "vez" : "veces"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          Última: {formatDate(answer.last_wrong_at)}
                        </span>
                      </div>
                    </div>

                    <h2 className="mb-4 text-lg font-extrabold leading-tight text-[#17305c] md:text-xl">
                      {answer.question_text}
                    </h2>

                    <div className="grid gap-2.5">
                      {(["a", "b", "c", "d"] as OptionKey[]).map((option) => (
                        <div
                          key={option}
                          className={getOptionClass(answer, option)}
                        >
                          <span className="mr-2 font-extrabold text-[#1d4ed8]">
                            {option.toUpperCase()})
                          </span>
                          {getOptionText(answer, option)}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <div className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700">
                        Última respuesta:{" "}
                        {answer.last_selected_option
                          ? answer.last_selected_option.toUpperCase()
                          : "Sin respuesta"}
                      </div>

                      <div className="rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-700">
                        Correcta: {answer.correct_option.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#dbe7ff] bg-[#f8fbff] p-4">
                <button
                  type="button"
                  onClick={goPreviousPage}
                  disabled={page <= 1}
                  className="rounded-xl border border-[#cfdcf3] bg-white px-5 py-3 text-sm font-bold text-[#123b86] transition hover:bg-[#eef5ff] disabled:opacity-40"
                >
                  Anterior
                </button>

                <p className="text-sm font-bold text-slate-600">
                  Página {page} de {totalPages}
                </p>

                <button
                  type="button"
                  onClick={goNextPage}
                  disabled={page >= totalPages}
                  className="rounded-xl bg-[#123b86] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f3577] disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl bg-[#123b86] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f3577]"
            >
              Volver al panel
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}