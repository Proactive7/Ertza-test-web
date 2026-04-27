"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS_DB } from "@/data/questions";
import { TOPICS } from "@/data/topics";
import {
  USER_POINTS_KEY,
  getAwardedPoints,
  getBadgeByPoints,
  type BadgeName,
} from "@/lib/badges";
import { saveTestResult } from "@/lib/stats";
import InfoBox from "./InfoBox";
import ResultRow from "./ResultRow";
import { OptionKey, Question, TopicKey } from "@/types/quiz";

type QuizProps = {
  tema: TopicKey;
  onExit: () => void;
  onHome: () => void;
};

type AnswerRecord = {
  question: Question;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
};

type DisplayBadgeKey = BadgeName;

type BadgeConfig = {
  icon: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
};

const BADGE_CONFIG: Record<DisplayBadgeKey, BadgeConfig> = {
  "Nivel 1": {
    icon: "/ranks/rank1.png",
    textClass: "text-[#6a7a99]",
    bgClass: "bg-[linear-gradient(135deg,_#f8fbff_0%,_#e9f1ff_100%)]",
    borderClass: "border-[#d7e5ff]",
  },
  "Nivel 2": {
    icon: "/ranks/rank2.png",
    textClass: "text-[#8a4b20]",
    bgClass: "bg-[linear-gradient(135deg,_#fff5ec_0%,_#f2d4b7_100%)]",
    borderClass: "border-[#e1b78f]",
  },
  "Nivel 3": {
    icon: "/ranks/rank3.png",
    textClass: "text-[#5a6876]",
    bgClass: "bg-[linear-gradient(135deg,_#f8fbff_0%,_#dee6ef_100%)]",
    borderClass: "border-[#cfd7e2]",
  },
  "Nivel 4": {
    icon: "/ranks/rank4.png",
    textClass: "text-[#8a6a00]",
    bgClass: "bg-[linear-gradient(135deg,_#fffbe3_0%,_#f4dc8d_100%)]",
    borderClass: "border-[#e6cf77]",
  },
  "Nivel 5": {
    icon: "/ranks/rank5.png",
    textClass: "text-[#0f6b86]",
    bgClass: "bg-[linear-gradient(135deg,_#edfaff_0%,_#cceef7_100%)]",
    borderClass: "border-[#b9e0ea]",
  },
  "Nivel 6": {
    icon: "/ranks/rank6.png",
    textClass: "text-[#9a5b00]",
    bgClass: "bg-[linear-gradient(135deg,_#fff7ed_0%,_#fed7aa_100%)]",
    borderClass: "border-[#fdba74]",
  },
  "Nivel 7": {
    icon: "/ranks/rank7.png",
    textClass: "text-[#5a35b1]",
    bgClass: "bg-[linear-gradient(135deg,_#f4eeff_0%,_#ddd0ff_100%)]",
    borderClass: "border-[#cdb8ff]",
  },
};

export default function Quiz({ tema, onExit, onHome }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [scoreReal, setScoreReal] = useState<number>(0);
  const [correctas, setCorrectas] = useState<number>(0);
  const [falladas, setFalladas] = useState<number>(0);
  const [enBlanco, setEnBlanco] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [time, setTime] = useState<number>(40 * 60);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([]);

  const [userPoints, setUserPoints] = useState<number>(0);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState<boolean>(false);
  const [lastUnlockedBadge, setLastUnlockedBadge] = useState<BadgeName | null>(
    null
  );

  const pointsAwardedRef = useRef<boolean>(false);

  const topicName = useMemo(() => {
    if (tema === "simulacro") return "Simulacro oficial";

    const found = TOPICS.find((item) => item.key === tema);
    return found ? found.title : tema;
  }, [tema]);

  const visibleScore = Math.max(0, scoreReal);

  const currentBadgeLevel = getBadgeByPoints(userPoints);
  const currentBadgeKey: DisplayBadgeKey = currentBadgeLevel.name;
  const currentBadgeConfig = BADGE_CONFIG[currentBadgeKey];

  useEffect(() => {
    const savedPoints =
      typeof window !== "undefined"
        ? Number(window.localStorage.getItem(USER_POINTS_KEY) || "0")
        : 0;

    setUserPoints(Number.isNaN(savedPoints) ? 0 : savedPoints);
  }, []);

  useEffect(() => {
    const pool = QUESTIONS_DB[tema] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 40);

    setQuestions(shuffled);
    setIndex(0);
    setScoreReal(0);
    setCorrectas(0);
    setFalladas(0);
    setEnBlanco(0);
    setFinished(false);
    setTime(40 * 60);
    setSelectedOption(null);
    setShowResult(false);
    setReviewMode(false);
    setAnswerHistory([]);
    setShowBadgeAnimation(false);
    setLastUnlockedBadge(null);
    pointsAwardedRef.current = false;
  }, [tema]);

  useEffect(() => {
    if (finished || questions.length === 0) return;

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [finished, questions.length]);

  useEffect(() => {
    if (!finished || pointsAwardedRef.current) return;

    const finalScore = Math.max(0, scoreReal);
    const earnedPoints = getAwardedPoints(finalScore);
    const previousPoints =
      typeof window !== "undefined"
        ? Number(window.localStorage.getItem(USER_POINTS_KEY) || "0")
        : 0;

    const safePreviousPoints = Number.isNaN(previousPoints) ? 0 : previousPoints;
    const nextPoints = safePreviousPoints + earnedPoints;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_POINTS_KEY, String(nextPoints));
    }

    const previousBadge = getBadgeByPoints(safePreviousPoints);
    const nextBadge = getBadgeByPoints(nextPoints);

    setUserPoints(nextPoints);

    saveTestResult({
      id: `${Date.now()}-${tema}-${Math.random().toString(36).slice(2, 8)}`,
      topicKey: tema,
      topicName,
      dateISO: new Date().toISOString(),
      score: finalScore,
      correct: correctas,
      incorrect: falladas,
      blank: enBlanco,
      answered: correctas + falladas,
      totalQuestions: questions.length,
      pointsEarned: earnedPoints,
      timeRemainingSeconds: time,
      timeSpentSeconds: 40 * 60 - time,
    });

    if (nextBadge && nextBadge.name !== previousBadge.name) {
      setLastUnlockedBadge(nextBadge.name);
      setShowBadgeAnimation(true);

      const timeout = setTimeout(() => {
        setShowBadgeAnimation(false);
      }, 2600);

      pointsAwardedRef.current = true;
      return () => clearTimeout(timeout);
    }

    pointsAwardedRef.current = true;
  }, [
    finished,
    scoreReal,
    tema,
    topicName,
    correctas,
    falladas,
    enBlanco,
    questions.length,
    time,
  ]);

  if (!questions.length) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#e8f0ff_40%,_#edf2f7_100%)] px-3 py-6">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-[#d9e7ff] bg-white/95 p-8 text-center shadow-[0_18px_50px_rgba(37,99,235,0.10)] backdrop-blur-sm">
          <p className="text-lg font-semibold text-slate-700">Cargando...</p>
        </div>
      </main>
    );
  }

  const falladasDetalle = answerHistory.filter(
    (item) => item.selectedOption !== null && !item.isCorrect
  );

  if (finished && reviewMode) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#e8f0ff_40%,_#edf2f7_100%)] px-3 py-4 md:px-4 md:py-5">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[26px] border border-[#d9e7ff] bg-white/95 p-4 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6a7a99]">
                  Corrección del examen
                </p>
                <h1 className="text-[24px] font-extrabold text-[#17305c] md:text-[30px]">
                  Preguntas falladas
                </h1>
              </div>

              <button
                onClick={() => setReviewMode(false)}
                className="rounded-xl border border-[#cfdcf3] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f8fbff]"
              >
                Volver al resultado
              </button>
            </div>

            {falladasDetalle.length === 0 ? (
              <div className="rounded-[18px] border border-green-200 bg-green-50 p-5 text-green-900">
                <p className="text-lg font-bold">No has fallado ninguna pregunta.</p>
                <p className="mt-1 text-sm">
                  No hay correcciones que mostrar en este intento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {falladasDetalle.map((item, idx) => (
                  <div
                    key={`${item.question.id}-${idx}`}
                    className="rounded-[22px] border border-[#d9e7ff] bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-4 shadow-sm"
                  >
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6a7a99]">
                      Pregunta fallada {idx + 1}
                    </p>

                    <h2 className="mb-4 text-lg font-extrabold leading-tight text-[#17305c] md:text-xl">
                      {item.question.pregunta}
                    </h2>

                    <div className="grid gap-2.5">
                      {(["a", "b", "c", "d"] as OptionKey[]).map((opt) => {
                        const isSelected = item.selectedOption === opt;
                        const isCorrect = item.correctOption === opt;

                        let className =
                          "rounded-[14px] border px-4 py-3 text-left text-[15px] leading-snug transition ";

                        if (isSelected && isCorrect) {
                          className += "border-green-500 bg-green-100 text-green-900";
                        } else if (isSelected) {
                          className += "border-red-500 bg-red-100 text-red-900";
                        } else if (isCorrect) {
                          className += "border-green-500 bg-green-50 text-green-900";
                        } else {
                          className += "border-[#dbe3ef] bg-white text-slate-700";
                        }

                        return (
                          <div key={opt} className={className}>
                            <span className="mr-2 font-extrabold text-[#1d4ed8]">
                              {opt.toUpperCase()})
                            </span>
                            {item.question[opt]}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <div className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700">
                        Tu respuesta: {item.selectedOption?.toUpperCase()}
                      </div>
                      <div className="rounded-lg bg-green-50 px-3 py-2 font-semibold text-green-700">
                        Correcta: {item.correctOption.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={onExit}
                className="rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
              >
                Volver a temas
              </button>

              <button
                onClick={onHome}
                className="rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (finished) {
    const notaFinal = Math.max(0, scoreReal);
    const earnedPoints = getAwardedPoints(notaFinal);

    let notaColorClass = "text-violet-500";
    let textoNota = "Excelente";

    if (notaFinal < 20) {
      notaColorClass = "text-red-500";
      textoNota = "Suspenso";
    } else if (notaFinal < 30) {
      notaColorClass = "text-emerald-600";
      textoNota = "Aprobado";
    }

    return (
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#e8f0ff_40%,_#edf2f7_100%)] px-3 py-3 md:px-4 md:py-4">
        <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-3xl flex-col justify-center">
          <div className="rounded-[26px] border border-[#d9e7ff] bg-white/95 p-4 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur-sm md:p-5">
            <h1 className="mb-4 text-[26px] font-extrabold leading-none text-[#17305c] md:text-[30px]">
              Resultado final
            </h1>

            <div className="grid gap-2">
              <ResultRow label="Aciertos" value={String(correctas)} />
              <ResultRow label="Fallos" value={String(falladas)} />
              <ResultRow label="En blanco" value={String(enBlanco)} />
              <ResultRow
                label="Respondidas"
                value={String(correctas + falladas)}
              />

              <div className="mt-1 flex items-center rounded-[16px] border border-[#cfe0ff] bg-[linear-gradient(135deg,_#eff6ff_0%,_#e0edff_100%)] px-4 py-3 shadow-sm">
                <span className="text-lg font-bold text-[#17305c] md:text-xl">
                  Nota final
                </span>

                <span
                  className={`flex-1 text-center text-lg font-bold md:text-xl ${notaColorClass}`}
                >
                  {textoNota}
                </span>

                <span
                  className={`text-[26px] font-extrabold leading-none ${notaColorClass}`}
                >
                  {notaFinal.toFixed(1)} / 40
                </span>
              </div>

              <div className="rounded-[16px] border border-[#d7e5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-[#17305c]">
                  Puntos conseguidos en este test:
                </span>{" "}
                <span className="font-bold text-[#1d4ed8]">+{earnedPoints}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                onClick={onExit}
                className="rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
              >
                Volver a temas
              </button>

              <button
                onClick={onHome}
                className="rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e40af]"
              >
                Ir al inicio
              </button>

              <button
                onClick={() => setReviewMode(true)}
                className="rounded-xl border border-[#f5b4b4] bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dc2626]"
              >
                Corrección · Premium
              </button>
            </div>

            <p className="mt-3 text-xs font-medium leading-snug text-[#dc2626] md:text-sm">
              La corrección muestra tus preguntas falladas, la opción elegida y la
              respuesta correcta.
            </p>
          </div>
        </div>

        {showBadgeAnimation && lastUnlockedBadge && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="animate-[badgePop_0.7s_ease-out] rounded-[24px] border border-[#d7e5ff] bg-white/95 px-8 py-6 text-center shadow-[0_24px_80px_rgba(37,99,235,0.20)] backdrop-blur-sm">
              <img
                src={BADGE_CONFIG[lastUnlockedBadge].icon}
                alt={lastUnlockedBadge}
                className="mx-auto h-20 w-20 object-contain"
              />
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#6a7a99]">
                Nueva insignia desbloqueada
              </p>
              <p
                className={`mt-2 text-2xl font-extrabold ${BADGE_CONFIG[lastUnlockedBadge].textClass}`}
              >
                {lastUnlockedBadge}
              </p>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes badgePop {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(12px);
            }
            60% {
              opacity: 1;
              transform: scale(1.05) translateY(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </main>
    );
  }

  const q = questions[index];
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  function getAnswerClass(option: OptionKey): string {
    const base =
      "rounded-[16px] border px-4 py-3 text-left text-[15px] leading-snug transition-all duration-200";

    if (!showResult) {
      return `${base} border-[#d7e5ff] bg-[#f8fbff] text-slate-700 shadow-sm hover:border-[#9ec5ff] hover:bg-[#eef5ff] hover:shadow-md`;
    }

    if (selectedOption === option && option === q.correcta) {
      return `${base} border-green-500 bg-green-100 text-green-900 shadow-sm`;
    }

    if (selectedOption === option && option !== q.correcta) {
      return `${base} border-red-500 bg-red-100 text-red-900 shadow-sm`;
    }

    return `${base} border-[#dbe3ef] bg-white text-slate-500 opacity-80`;
  }

  function goToNextQuestion(): void {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function answer(option: OptionKey): void {
    if (showResult) return;

    const isCorrect = option === q.correcta;

    setSelectedOption(option);
    setShowResult(true);

    setAnswerHistory((prev) => [
      ...prev,
      {
        question: q,
        selectedOption: option,
        correctOption: q.correcta,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setCorrectas((prev) => prev + 1);
      setScoreReal((prev) => prev + 1);
    } else {
      setFalladas((prev) => prev + 1);
      setScoreReal((prev) => prev - 0.3);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 900);
  }

  function skipQuestion(): void {
    if (showResult) return;

    setAnswerHistory((prev) => [
      ...prev,
      {
        question: q,
        selectedOption: null,
        correctOption: q.correcta,
        isCorrect: false,
      },
    ]);

    setEnBlanco((prev) => prev + 1);
    goToNextQuestion();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#e8f0ff_35%,_#edf2f7_100%)] px-3 py-3 md:px-4 md:py-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 rounded-[20px] border border-[#d7e5ff] bg-[linear-gradient(135deg,_rgba(255,255,255,0.97)_0%,_rgba(239,246,255,0.93)_100%)] px-3 py-3 shadow-[0_14px_40px_rgba(37,99,235,0.08)] backdrop-blur-sm md:px-4 md:py-3.5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <button
                onClick={onHome}
                aria-label="Volver al inicio"
                className="flex items-center transition hover:opacity-80"
              >
                <Image
                  src="/ErtzaTest.png"
                  alt="ErtzaTest"
                  width={220}
                  height={64}
                  className="h-11 w-auto object-contain md:h-14"
                  priority
                />
              </button>

              <button
                onClick={onExit}
                className="rounded-lg border border-[#cfdcf3] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-[#f8fbff] md:px-4 md:py-2 md:text-sm"
              >
                Salir
              </button>
            </div>

            <div className="flex justify-center">
              <div
                className={`flex min-w-[82px] flex-col items-center justify-center rounded-[14px] border px-3 py-2 text-center shadow-sm transition-all duration-300 ${currentBadgeConfig.bgClass} ${currentBadgeConfig.borderClass} ${
                  showBadgeAnimation ? "scale-110" : "scale-100"
                }`}
              >
                <img
                  src={currentBadgeConfig.icon}
                  alt={currentBadgeKey}
                  className="h-8 w-8 object-contain md:h-9 md:w-9"
                />
                <span
                  className={`mt-1 text-[9px] font-bold uppercase tracking-[0.08em] md:text-[10px] ${currentBadgeConfig.textClass}`}
                >
                  {currentBadgeKey}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2.5 md:justify-end">
              <div className="min-w-[150px] rounded-xl border border-[#cfe0ff] bg-[linear-gradient(135deg,_#eef5ff_0%,_#dbeafe_100%)] px-4 py-2.5 text-center shadow-sm md:min-w-[165px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5f76a0]">
                  Tiempo restante
                </p>
                <div className="mt-0.5 text-lg font-extrabold text-[#17305c] md:text-xl">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
              </div>

              <div className="min-w-[150px] rounded-xl border border-[#d7e5ff] bg-white/90 px-4 py-2.5 text-center shadow-sm md:min-w-[165px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5f76a0]">
                  Progreso
                </p>
                <div className="mt-0.5 text-xs font-bold text-[#17305c] md:text-sm">
                  Pregunta {index + 1} / {questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3 grid gap-2.5 md:grid-cols-3">
          <InfoBox label="Tema" value={topicName} />
          <InfoBox
            label="Aciertos / Fallos"
            value={`${correctas} / ${falladas}`}
          />
          <InfoBox
            label="Puntuación actual"
            value={visibleScore.toFixed(1)}
            highlight
          />
        </div>

        <div className="rounded-[24px] border border-[#d7e5ff] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(244,249,255,0.98)_100%)] p-4 shadow-[0_22px_70px_rgba(37,99,235,0.10)] md:p-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6a7a99]">
            Cuestionario en curso
          </p>

          <h2 className="mb-4 text-xl font-extrabold leading-tight text-[#17305c] md:text-2xl">
            {q.pregunta}
          </h2>

          <div className="grid gap-2.5">
            {(["a", "b", "c", "d"] as OptionKey[]).map((opt) => (
              <button
                key={opt}
                onClick={() => answer(opt)}
                disabled={showResult}
                className={getAnswerClass(opt)}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-extrabold text-[#1d4ed8]">
                  {opt.toUpperCase()}
                </span>
                <span>{q[opt]}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[18px] border border-[#d7e5ff] bg-[#f8fbff] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Si no quieres responder, puedes dejarla en blanco y continuar.
              </p>

              <button
                onClick={skipQuestion}
                disabled={showResult}
                className="rounded-lg border border-[#cfdcf3] bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Dejar en blanco
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}