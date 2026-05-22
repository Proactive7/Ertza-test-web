"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OptionKey, TestAttempt, TestAttemptAnswer } from "@/types/quiz";

type TestReviewPageProps = {
  attemptId: string;
  onBack: () => void;
};

function formatScore(score: number): string {
  const numericScore = Number(score);
  return Number.isInteger(numericScore)
    ? String(numericScore)
    : numericScore.toFixed(1);
}

function formatDate(dateISO: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateISO));
}

function getOptionText(answer: TestAttemptAnswer, option: OptionKey): string {
  if (option === "a") return answer.option_a;
  if (option === "b") return answer.option_b;
  if (option === "c") return answer.option_c;
  return answer.option_d;
}

function getOptionClass(answer: TestAttemptAnswer, option: OptionKey): string {
  const isSelected = answer.selected_option === option;
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

export default function TestReviewPage({
  attemptId,
  onBack,
}: TestReviewPageProps) {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<TestAttemptAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttemptReview() {
      setLoading(true);

      const { data: attemptData, error: attemptError } = await supabase
        .from("test_attempts")
        .select("*")
        .eq("id", attemptId)
        .single();

      if (attemptError) {
        console.error("Error cargando intento:", attemptError.message);
        setAttempt(null);
        setAnswers([]);
        setLoading(false);
        return;
      }

      const { data: answersData, error: answersError } = await supabase
        .from("test_attempt_answers")
        .select("*")
        .eq("attempt_id", attemptId)
        .order("created_at", { ascending: true });

      if (answersError) {
        console.error("Error cargando respuestas:", answersError.message);
        setAnswers([]);
      } else {
        setAnswers((answersData || []) as TestAttemptAnswer[]);
      }

      setAttempt(attemptData as TestAttempt);
      setLoading(false);
    }

    if (attemptId) {
      void fetchAttemptReview();
    }
  }, [attemptId]);

  const wrongAnswers = useMemo(() => {
    return answers.filter((answer) => !answer.is_correct && !answer.is_blank);
  }, [answers]);

  const blankAnswers = useMemo(() => {
    return answers.filter((answer) => answer.is_blank);
  }, [answers]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
        <div className="mx-auto max-w-[950px] rounded-[20px] border border-white/60 bg-white p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
          <p className="text-sm font-bold text-[#123b86]">
            Cargando corrección...
          </p>
        </div>
      </main>
    );
  }

  if (!attempt) {
    return (
      <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
        <div className="mx-auto max-w-[950px] rounded-[20px] border border-white/60 bg-white p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
          <h1 className="text-xl font-extrabold text-[#123b86]">
            No se pudo cargar la corrección
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Este intento no existe o todavía no tiene respuestas guardadas.
          </p>

          <button
            onClick={onBack}
            className="mt-5 rounded-xl bg-[#123b86] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f3577]"
          >
            Volver al panel
          </button>
        </div>
      </main>
    );
  }

  const notaFinal = Number(attempt.score);
  const notaColorClass =
    notaFinal < 20
      ? "text-red-500"
      : notaFinal < 30
        ? "text-emerald-600"
        : "text-violet-500";

  const textoNota =
    notaFinal < 20 ? "Suspenso" : notaFinal < 30 ? "Aprobado" : "Excelente";

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
            Corrección guardada
          </p>

          <h1 className="mt-2 text-[24px] font-extrabold md:text-[30px]">
            {attempt.topic_name}
          </h1>

          <p className="mt-2 text-sm text-blue-100">
            Realizado el {formatDate(attempt.created_at)}
          </p>
        </section>

        <section className="px-4 py-6 md:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[18px] border border-[#dbe7ff] bg-[#f8fbff] p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Nota final
              </p>

              <p className={`mt-2 text-[28px] font-extrabold ${notaColorClass}`}>
                {formatScore(notaFinal)} / 40
              </p>

              <p className={`mt-1 text-sm font-bold ${notaColorClass}`}>
                {textoNota}
              </p>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Aciertos
              </p>
              <p className="mt-2 text-[28px] font-extrabold text-emerald-600">
                {attempt.correct_answers}
              </p>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Fallos
              </p>
              <p className="mt-2 text-[28px] font-extrabold text-red-500">
                {attempt.wrong_answers}
              </p>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Blancas
              </p>
              <p className="mt-2 text-[28px] font-extrabold text-slate-500">
                {attempt.blank_answers}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dbe7ff] bg-[#f8fbff] p-4">
            <h2 className="text-[18px] font-extrabold text-[#1f3762]">
              Preguntas falladas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Revisa tu respuesta marcada y la opción correcta para reforzar tus
              puntos débiles.
            </p>
          </div>

          <div className="mt-4">
            {wrongAnswers.length === 0 ? (
              <div className="rounded-[18px] border border-green-200 bg-green-50 p-5 text-green-900">
                <p className="text-lg font-bold">
                  No has fallado ninguna pregunta.
                </p>

                {blankAnswers.length > 0 ? (
                  <p className="mt-1 text-sm">
                    Solo dejaste {blankAnswers.length} pregunta
                    {blankAnswers.length === 1 ? "" : "s"} en blanco.
                  </p>
                ) : (
                  <p className="mt-1 text-sm">
                    Has completado este test sin fallos.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {wrongAnswers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className="rounded-[22px] border border-[#d9e7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-sm"
                  >
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6a7a99]">
                      Pregunta fallada {index + 1}
                    </p>

                    <h3 className="mb-4 text-lg font-extrabold leading-tight text-[#17305c] md:text-xl">
                      {answer.question_text}
                    </h3>

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
                        Tu respuesta:{" "}
                        {answer.selected_option
                          ? answer.selected_option.toUpperCase()
                          : "En blanco"}
                      </div>

                      <div className="rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-700">
                        Correcta: {answer.correct_option.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
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
