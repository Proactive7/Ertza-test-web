"use client";

import type React from "react";
import { useEffect, useState } from "react";

import LandingPage from "@/components/landing/LandingPage";
import PanelPage from "@/components/panel/PanelPage";
import ProfilePage from "@/components/profile/ProfilePage";
import RankingPage from "@/components/ranking/RankingPage";
import BadgesPage from "@/components/badges/BadgesPage";
import CookiesContent from "@/components/legal/CookiesContent";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyContent from "@/components/legal/PrivacyContent";
import TermsContent from "@/components/legal/TermsContent";
import Quiz from "@/components/quiz/Quiz";
import TopicsPage from "@/components/topics/TopicsPage";
import IdleSessionGuard from "@/components/idlesessionguard/IdleSessionGuard";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { TopicKey, ViewMode } from "@/types/quiz";

type AppViewMode = ViewMode | "ranking" | "profile";

type RankingRow = {
  user_id: string;
  username: string;
  simulacros_realizados: number;
  media_simulacros: number;
  mejor_simulacro: number;
  badge_points: number;
};

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
  const [trialUsed, setTrialUsed] = useState(false);
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
        setTrialUsed(false);
        setBadgePoints(0);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("premium, trial_used")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error.message);
        setHasActiveSubscription(false);
        setTrialUsed(false);
      } else {
        setHasActiveSubscription(Boolean(data?.premium));
        setTrialUsed(Boolean(data?.trial_used));
      }

      await fetchBadgePoints(user.id);
    }

    fetchProfile();
  }, [user, loading]);

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setHasActiveSubscription(false);
    setTrialUsed(false);
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
        Authorization: `Bearer ${data.session.access_token}`,
      },
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
          trialUsed={trialUsed}
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
          trialUsed={trialUsed}
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
        <RankingPage
          user={user}
          ranking={ranking}
          rankingLoading={rankingLoading}
          onBack={goHome}
        />
      </AppShell>
    );
  }

  if (view === "insignias") {
    return (
      <AppShell isLoggedIn={isLoggedIn}>
        <BadgesPage badgePoints={badgePoints} onBack={goHome} />
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
        trialUsed={trialUsed}
        user={user}
        onLogout={logout}
      />
    </AppShell>
  );
}