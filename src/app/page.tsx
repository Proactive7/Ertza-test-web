"use client";

import type React from "react";
import { useEffect, useState } from "react";

import LandingPage from "@/components/landing/LandingPage";
import PanelPage from "@/components/panel/PanelPage";
import ProfilePage from "@/components/profile/ProfilePage";
import CookiesContent from "@/components/legal/CookiesContent";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";
import Quiz from "@/components/quiz/Quiz";
import TopicsPage from "@/components/topics/TopicsPage";
import IdleSessionGuard from "@/components/idlesessionguard/IdleSessionGuard";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  BADGE_LEVELS,
  getBadgeByPoints,
  getProgressToNextBadge,
} from "@/lib/badges";
import { TopicKey, ViewMode } from "@/types/quiz";

type AppViewMode = ViewMode | "ranking" | "profile";

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

function InteractiveEffects({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            button:not(:disabled),
            a[role="button"],
            .ertzatest-interactive {
              transition:
                transform 180ms ease,
                box-shadow 180ms ease,
                border-color 180ms ease,
                background-color 180ms ease,
                color 180ms ease,
                filter 180ms ease;
            }

            @media (hover: hover) {
              button:not(:disabled):hover,
              a[role="button"]:hover,
              .ertzatest-interactive:hover {
                transform: translateY(-2px) scale(1.015);
                box-shadow: 0 14px 30px rgba(18, 59, 134, 0.18);
                filter: brightness(1.04);
              }
            }

            button:not(:disabled):active,
            a[role="button"]:active,
            .ertzatest-interactive:active {
              transform: translateY(0) scale(0.985);
            }

            button:focus-visible,
            a[role="button"]:focus-visible,
            .ertzatest-interactive:focus-visible {
              outline: 3px solid rgba(95, 137, 216, 0.45);
              outline-offset: 3px;
            }

            button:disabled {
              cursor: not-allowed;
              opacity: 0.65;
            }
          `,
        }}
      />

      {children}
    </>
  );
}

function AppShell({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {
  return (
    <InteractiveEffects>
      {isLoggedIn ? <IdleSessionGuard /> : null}
      {children}
    </InteractiveEffects>
  );
}

export default function Home() {
  const { user, loading } = useUser();

  const [view, setView] = useState<AppViewMode>("home");
  const [tema, setTema] = useState<TopicKey | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [badgePoints, setBadgePoints] = useState<number>(0);

  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  async function fetchBadgePoints(userId: string | undefined): Promise<void> {
    if (!userId) {
      setBadgePoints(0);
      return;
    }

    const { data, error } = await supabase
      .from("test_results")
      .select("points_earned")
      .eq("user_id", userId);

    if (error) {
      console.error("Error cargando puntos:", error.message);
      setBadgePoints(0);
      return;
    }

    const totalPoints = (data || []).reduce(
      (sum, result) => sum + Number(result.points_earned || 0),
      0
    );

    setBadgePoints(totalPoints);
  }

  async function fetchRanking(): Promise<void> {
    setRankingLoading(true);

    const { data, error } = await supabase
      .from("simulacro_ranking")
      .select("*")
      .order("media_simulacros", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error cargando ranking:", error.message);
      setRanking([]);
    } else {
      setRanking((data || []) as RankingRow[]);
    }

    setRankingLoading(false);
  }

  useEffect(() => {
    async function fetchProfile() {
      if (loading) return;

      if (!user?.id) {
        setHasActiveSubscription(false);
        setBadgePoints(0);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("premium")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error.message);
        setHasActiveSubscription(false);
      } else {
        setHasActiveSubscription(Boolean(data?.premium));
      }

      await fetchBadgePoints(user.id);
    }

    fetchProfile();
  }, [user, loading]);

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setHasActiveSubscription(false);
    setBadgePoints(0);
    window.location.href = "/";
  }

  function requireLogin(): boolean {
    if (loading) return false;

    if (!user?.id) {
      window.location.href = "/login";
      return false;
    }

    return true;
  }

  async function goToCheckout(): Promise<void> {
    if (!requireLogin()) return;

    if (!user?.id) {
      window.location.href = "/login";
      return;
    }

    if (hasActiveSubscription) {
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
      console.error("No se pudo obtener la sesión para Stripe:", error?.message);
      window.location.href = "/login";
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    const checkoutData = await response.json();

    if (!response.ok || !checkoutData?.url) {
      console.error("Error creando checkout:", checkoutData);
      alert("No se pudo abrir la pasarela de pago. Inténtalo de nuevo.");
      return;
    }

    window.location.href = checkoutData.url;
  }

  function scrollTop(): void {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goHome(): void {
    setView("home");
    setTema(null);
    scrollTop();
  }

  function openTopics(): void {
    if (!requireLogin()) return;

    setView("topics");
    setTema(null);
    scrollTop();
  }

  function openQuiz(topicKey: TopicKey): void {
    if (!requireLogin()) return;

    if (topicKey === "simulacro" && !hasActiveSubscription) {
      void goToCheckout();
      return;
    }

    setTema(topicKey);
    setView("quiz");
    scrollTop();
  }

  function openPanel(): void {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      void goToCheckout();
      return;
    }

    setView("panel");
    scrollTop();
  }

  async function openBadges(): Promise<void> {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      void goToCheckout();
      return;
    }

    await fetchBadgePoints(user?.id);

    setView("insignias");
    scrollTop();
  }

  function openMockExam(): void {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      void goToCheckout();
      return;
    }

    setTema("simulacro");
    setView("quiz");
    scrollTop();
  }

  async function openRanking(): Promise<void> {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      void goToCheckout();
      return;
    }

    await fetchRanking();
    setView("ranking");
    scrollTop();
  }

  function openProfile(): void {
    if (!requireLogin()) return;

    setView("profile");
    scrollTop();
  }

  function openLegalTerms(): void {
    setView("legal_terms");
    scrollTop();
  }

  function openLegalPrivacy(): void {
    setView("legal_privacy");
    scrollTop();
  }

  function openLegalCookies(): void {
    setView("legal_cookies");
    scrollTop();
  }

  const isLoggedIn = Boolean(user?.id);

  if (loading) {
    return (
      <AppShell isLoggedIn={false}>
        <main className="flex min-h-screen items-center justify-center bg-[#d8dde4] px-4">
          <div className="rounded-2xl border border-white/60 bg-white px-6 py-5 text-center shadow-lg">
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="mx-auto h-[52px] w-auto object-contain"
            />
            <p className="mt-4 text-sm font-bold text-[#123b86]">
              Cargando sesión...
            </p>
          </div>
        </main>
      </AppShell>
    );
  }

  if (view === "topics") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <TopicsPage
          onBack={goHome}
          onStart={openQuiz}
          onOpenCheckout={goToCheckout}
          hasActiveSubscription={hasActiveSubscription}
        />
      </AppShell>
    );
  }

  if (view === "quiz" && tema) {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <Quiz tema={tema} onExit={openTopics} onHome={goHome} />
      </AppShell>
    );
  }

  if (view === "panel") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <PanelPage onBack={goHome} />
      </AppShell>
    );
  }

  if (view === "profile") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <ProfilePage
          user={user}
          hasActiveSubscription={hasActiveSubscription}
          onBack={goHome}
          onLogout={logout}
          onOpenCheckout={goToCheckout}
        />
      </AppShell>
    );
  }

  if (view === "ranking") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
          <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
              <button
                onClick={goHome}
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
                onClick={goHome}
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
                Ranking basado únicamente en simulacros oficiales. Para aparecer
                en el Top necesitas completar al menos 20 simulacros.
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
      </AppShell>
    );
  }

  if (view === "insignias") {
    const currentPoints = badgePoints;
    const progressData = getProgressToNextBadge(currentPoints);
    const currentBadge = getBadgeByPoints(currentPoints);
    const nextBadge = progressData.next;
    const progressPercent = Math.round(progressData.progress);
    const currentBadgeLabel = currentBadge.name;

    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
          <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
              <button
                onClick={goHome}
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
                onClick={goHome}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 md:text-sm"
              >
                Volver
              </button>
            </div>

            <section className="bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-6 text-white md:px-6">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100 backdrop-blur">
                Sistema premium
              </div>

              <h1 className="mt-3 text-[24px] font-extrabold md:text-[30px]">
                Insignias y progresión
              </h1>

              <p className="mt-2 max-w-[620px] text-[14px] leading-[1.6] text-blue-100 md:text-[15px]">
                Acumula puntos aprobando tests y sube de rango con nuevas
                insignias. Cuanto mejor rindas, más rápido progresas.
              </p>
            </section>

            <section className="px-4 py-6 md:px-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">
                    Puntos actuales
                  </p>
                  <p className="mt-1 text-[24px] font-extrabold text-[#123b86]">
                    {currentPoints}
                  </p>
                </div>

                <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">
                    Insignia actual
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[20px] font-extrabold text-[#123b86]">
                    <img
                      src={currentBadge.icon}
                      alt={currentBadge.name}
                      className="h-9 w-9 object-contain"
                    />
                    {currentBadgeLabel}
                  </div>
                </div>

                <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">
                    Siguiente rango
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[20px] font-extrabold text-[#123b86]">
                    {nextBadge ? (
                      <>
                        <img
                          src={nextBadge.icon}
                          alt={nextBadge.name}
                          className="h-9 w-9 object-contain"
                        />
                        {nextBadge.name}
                      </>
                    ) : (
                      "Máximo alcanzado"
                    )}
                  </div>
                </div>

                <div className="rounded-[16px] border border-slate-200 bg-[#f8fbff] p-4 shadow-sm">
                  <p className="text-xs font-bold text-slate-500">
                    Progreso actual
                  </p>
                  <p className="mt-1 text-[20px] font-extrabold text-[#123b86]">
                    {nextBadge
                      ? `${currentPoints} / ${nextBadge.min}`
                      : `${currentPoints} puntos`}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="text-[18px] font-extrabold text-[#1f3762]">
                    Progreso hacia la siguiente insignia
                  </h2>
                  <span className="text-xs font-bold text-slate-500">
                    {progressPercent}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#123b86_0%,#5f89d8_100%)] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="mt-2 text-[13px] text-slate-500">
                  {nextBadge
                    ? `Te faltan ${progressData.pointsNeeded} puntos para desbloquear ${nextBadge.name}.`
                    : "Has alcanzado la insignia máxima disponible."}
                </p>
              </div>

              <div className="mt-5 rounded-[18px] border border-[#dbe7ff] bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] p-4 text-white shadow-[0_18px_40px_rgba(15,53,119,0.18)]">
                <h2 className="mb-3 text-[18px] font-extrabold">
                  Cómo funciona
                </h2>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-green-300/40 bg-green-500/15 p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-green-100">
                      Test aprobado
                    </p>
                    <p className="mt-1 text-[22px] font-extrabold text-green-300">
                      +1 punto
                    </p>
                    <p className="mt-1 text-xs text-green-100">
                      Nota entre 20 y 30
                    </p>
                  </div>

                  <div className="rounded-2xl border border-violet-300/40 bg-violet-500/15 p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-violet-100">
                      Test excelente
                    </p>
                    <p className="mt-1 text-[22px] font-extrabold text-violet-300">
                      +2 puntos
                    </p>
                    <p className="mt-1 text-xs text-violet-100">
                      Nota entre 30 y 40
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-300/40 bg-red-500/15 p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-red-100">Suspenso</p>
                    <p className="mt-1 text-[22px] font-extrabold text-red-300">
                      0 puntos
                    </p>
                    <p className="mt-1 text-xs text-red-100">
                      Nota entre 0 y 20
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="mb-3 text-[18px] font-extrabold text-[#1f3762]">
                  Rangos de insignias
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {BADGE_LEVELS.map((badge) => {
                    const isCurrent = currentBadge.name === badge.name;
                    const isUnlocked = currentPoints >= badge.min;

                    return (
                      <div
                        key={badge.min}
                        className={`rounded-[16px] border bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                          isCurrent
                            ? "border-[#123b86] ring-2 ring-[#dbe7ff]"
                            : "border-slate-200"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full ${
                            isUnlocked
                              ? "bg-[#eef5ff]"
                              : "bg-slate-100 opacity-70"
                          }`}
                        >
                          <img
                            src={badge.icon}
                            alt={badge.name}
                            className="h-10 w-10 object-contain"
                          />
                        </div>

                        <p className="text-[17px] font-extrabold text-[#1f3762]">
                          {badge.name}
                        </p>

                        <p className="mt-1 text-[13px] text-slate-500">
                          {badge.min} puntos
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  if (view === "legal_terms") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <LegalPage
          title="Términos legales"
          onBack={goHome}
          content={<TermsContent />}
        />
      </AppShell>
    );
  }

  if (view === "legal_privacy") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <LegalPage
          title="Política de privacidad"
          onBack={goHome}
          content={<PrivacyContent />}
        />
      </AppShell>
    );
  }

  if (view === "legal_cookies") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <LegalPage
          title="Política de cookies"
          onBack={goHome}
          content={<CookiesContent />}
        />
      </AppShell>
    );
  }

  return (
    <AppShell isLoggedIn={isLoggedIn}>
      <LandingPage
        onOpenTopics={openTopics}
        onGoHome={goHome}
        onOpenPanel={openPanel}
        onOpenBadges={openBadges}
        onOpenMockExam={openMockExam}
        onOpenRanking={openRanking}
        onOpenProfile={openProfile}
        onOpenLegalTerms={openLegalTerms}
        onOpenLegalPrivacy={openLegalPrivacy}
        onOpenLegalCookies={openLegalCookies}
        onOpenCheckout={goToCheckout}
        hasActiveSubscription={hasActiveSubscription}
        user={user}
        onLogout={logout}
      />
    </AppShell>
  );
}