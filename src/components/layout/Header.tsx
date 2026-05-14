"use client";

import Link from "next/link";
import { useState } from "react";

type HeaderProps = {
  onGoHome: () => void;
  onOpenTopics: () => void;
  onOpenPanel: () => void;
  onOpenBadges: () => void;
  onOpenMockExam: () => void;
  onOpenRanking: () => void;
  onOpenPremium?: () => void | Promise<void>;
  onOpenProfile?: () => void;

  username?: string | null;
  isLoggedIn?: boolean;
  hasActiveSubscription?: boolean;
  trialUsed?: boolean;
  onLogout?: () => void | Promise<void>;
};

export default function Header({
  onGoHome,
  onOpenTopics,
  onOpenPanel,
  onOpenBadges,
  onOpenMockExam,
  onOpenRanking,
  onOpenPremium,
  onOpenProfile,
  username,
  isLoggedIn = false,
  hasActiveSubscription = false,
  trialUsed = false,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showLocks = isLoggedIn && !hasActiveSubscription;

  const premiumButtonText = trialUsed
    ? "Premium"
    : "Premium 7 días gratis";

  function handlePremiumClick(): void {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (hasActiveSubscription) return;

    if (onOpenPremium) {
      void onOpenPremium();
    }
  }

  function handlePremiumProtectedClick(action: () => void): void {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (!hasActiveSubscription) {
      if (onOpenPremium) {
        void onOpenPremium();
      }
      return;
    }

    action();
    setMobileMenuOpen(false);
  }

  function handleProfileClick(): void {
    if (onOpenProfile) {
      onOpenProfile();
    }

    setMobileMenuOpen(false);
  }

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        {/* LOGO */}
        <button onClick={onGoHome} className="flex items-center">
          <img
            src="/ErtzaTest.png"
            alt="ErtzaTest"
            className="h-[42px] w-auto object-contain md:h-[48px]"
          />
        </button>

        {/* MENÚ DESKTOP */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          <button onClick={onOpenTopics}>Temas</button>

          <button onClick={() => handlePremiumProtectedClick(onOpenMockExam)}>
            Simulacro {showLocks ? "🔒" : ""}
          </button>

          <button onClick={() => handlePremiumProtectedClick(onOpenPanel)}>
            Panel {showLocks ? "🔒" : ""}
          </button>

          <button onClick={() => handlePremiumProtectedClick(onOpenBadges)}>
            Insignias {showLocks ? "🔒" : ""}
          </button>

          <button onClick={() => handlePremiumProtectedClick(onOpenRanking)}>
            Ranking {showLocks ? "🔒" : ""}
          </button>
        </nav>

        {/* DERECHA DESKTOP */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn && hasActiveSubscription ? (
            <span className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
              Premium activo ✅
            </span>
          ) : (
            <button
              onClick={handlePremiumClick}
              className="rounded-xl bg-[#ef4444] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#dc2626]"
            >
              {premiumButtonText}
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                onClick={handleProfileClick}
                className="flex-col rounded-xl px-2 py-1 text-right transition hover:bg-[#f8fbff] sm:flex"
                title="Abrir perfil"
              >
                <span className="text-xs text-slate-500">
                  Conectado como
                </span>

                <span className="text-sm font-bold text-[#123b86] underline-offset-4 hover:underline">
                  {username || "Usuario"}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="rounded-xl bg-[#123b86] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0f3577]"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              role="button"
              className="rounded-xl bg-[#123b86] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f3577]"
            >
              Acceder
            </Link>
          )}
        </div>

        {/* BOTÓN MÓVIL */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-2xl md:hidden"
        >
          ☰
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {mobileMenuOpen && (
        <div className="space-y-3 border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <button
            onClick={() => {
              onOpenTopics();
              setMobileMenuOpen(false);
            }}
            className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold"
          >
            Temas
          </button>

          <button
            onClick={() => handlePremiumProtectedClick(onOpenMockExam)}
            className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold"
          >
            Simulacro {showLocks ? "🔒" : ""}
          </button>

          <button
            onClick={() => handlePremiumProtectedClick(onOpenPanel)}
            className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold"
          >
            Panel {showLocks ? "🔒" : ""}
          </button>

          <button
            onClick={() => handlePremiumProtectedClick(onOpenBadges)}
            className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold"
          >
            Insignias {showLocks ? "🔒" : ""}
          </button>

          <button
            onClick={() => handlePremiumProtectedClick(onOpenRanking)}
            className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold"
          >
            Ranking {showLocks ? "🔒" : ""}
          </button>

          {!hasActiveSubscription && (
            <button
              onClick={handlePremiumClick}
              className="block w-full rounded-xl bg-[#ef4444] px-4 py-3 font-bold text-white"
            >
              {premiumButtonText}
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                onClick={handleProfileClick}
                className="block w-full rounded-xl bg-[#123b86] px-4 py-3 font-bold text-white"
              >
                Perfil ({username})
              </button>

              <button
                onClick={onLogout}
                className="block w-full rounded-xl bg-slate-800 px-4 py-3 font-bold text-white"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block w-full rounded-xl bg-[#123b86] px-4 py-3 text-center font-bold text-white"
            >
              Acceder
            </Link>
          )}
        </div>
      )}
    </header>
  );
}