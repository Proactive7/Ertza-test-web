"use client";

import { useEffect, useState } from "react";

import LandingPage from "@/components/landing/LandingPage";
import PanelPage from "@/components/panel/PanelPage";
import CookiesContent from "@/components/legal/CookiesContent";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";
import Quiz from "@/components/quiz/Quiz";
import TopicsPage from "@/components/topics/TopicsPage";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  BADGE_LEVELS,
  getBadgeByPoints,
  getProgressToNextBadge,
} from "@/lib/badges";
import { TopicKey, ViewMode } from "@/types/quiz";

export default function Home() {
  const user = useUser();

  const [view, setView] = useState<ViewMode>("home");
  const [tema, setTema] = useState<TopicKey | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [badgePoints, setBadgePoints] = useState<number>(0);

  async function fetchBadgePoints(userId: string): Promise<void> {
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

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
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
        setHasActiveSubscription(false);
      } else {
        setHasActiveSubscription(Boolean(data?.premium));
      }

      await fetchBadgePoints(user.id);
    }

    fetchProfile();
  }, [user]);

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setHasActiveSubscription(false);
    setBadgePoints(0);
    window.location.href = "/";
  }

  function requireLogin(): boolean {
    if (!user) {
      window.location.href = "/login";
      return false;
    }

    return true;
  }

  function showPremiumRequired(message: string): void {
    alert(`🔒 ${message}`);
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
      showPremiumRequired(
        "Los simulacros están bloqueados. Necesitas Premium para hacer simulacros."
      );
      return;
    }

    setTema(topicKey);
    setView("quiz");
    scrollTop();
  }

  function openPanel(): void {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      showPremiumRequired(
        "El panel está bloqueado. Necesitas Premium para acceder."
      );
      return;
    }

    setView("panel");
    scrollTop();
  }

  async function openBadges(): Promise<void> {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      showPremiumRequired(
        "Las insignias están bloqueadas. Necesitas Premium para ver tu progresión."
      );
      return;
    }

    if (user) {
      await fetchBadgePoints(user.id);
    }

    setView("insignias");
    scrollTop();
  }

  function openMockExam(): void {
    if (!requireLogin()) return;

    if (!hasActiveSubscription) {
      showPremiumRequired(
        "Los simulacros están bloqueados. Necesitas Premium para hacer simulacros."
      );
      return;
    }

    setTema("simulacro");
    setView("quiz");
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

  if (view === "topics") {
    return (
      <TopicsPage
        onBack={goHome}
        onStart={openQuiz}
        hasActiveSubscription={hasActiveSubscription}
      />
    );
  }

  if (view === "quiz" && tema) {
    return <Quiz tema={tema} onExit={openTopics} onHome={goHome} />;
  }

  if (view === "panel") {
    return <PanelPage onBack={goHome} />;
  }

  if (view === "insignias") {
    const currentPoints = badgePoints;
    const progressData = getProgressToNextBadge(currentPoints);
    const currentBadge = getBadgeByPoints(currentPoints);
    const nextBadge = progressData.next;
    const progressPercent = Math.round(progressData.progress);
    const currentBadgeLabel = currentBadge.name;

    return (
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
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold text-blue-100">
                    Test aprobado
                  </p>
                  <p className="mt-1 text-[22px] font-extrabold">+1 punto</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold text-blue-100">
                    Test excelente
                  </p>
                  <p className="mt-1 text-[22px] font-extrabold">+2 puntos</p>
                  <p className="mt-1 text-xs text-blue-100">
                    Nota entre 30 y 40
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold text-blue-100">Suspenso</p>
                  <p className="mt-1 text-[22px] font-extrabold">0 puntos</p>
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
    );
  }

  if (view === "legal_terms") {
    return (
      <LegalPage
        title="Términos legales"
        onBack={goHome}
        content={<TermsContent />}
      />
    );
  }

  if (view === "legal_privacy") {
    return (
      <LegalPage
        title="Política de privacidad"
        onBack={goHome}
        content={<PrivacyContent />}
      />
    );
  }

  if (view === "legal_cookies") {
    return (
      <LegalPage
        title="Política de cookies"
        onBack={goHome}
        content={<CookiesContent />}
      />
    );
  }

  return (
    <LandingPage
      onOpenTopics={openTopics}
      onGoHome={goHome}
      onOpenPanel={openPanel}
      onOpenBadges={openBadges}
      onOpenMockExam={openMockExam}
      onOpenLegalTerms={openLegalTerms}
      onOpenLegalPrivacy={openLegalPrivacy}
      onOpenLegalCookies={openLegalCookies}
      hasActiveSubscription={hasActiveSubscription}
      user={user}
      onLogout={logout}
    />
  );
}