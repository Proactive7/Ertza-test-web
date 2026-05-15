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
  const premiumButtonText = trialUsed ? "Premium" : "Premium 7 días gratis";

  function closeMobileMenu(): void {
    setMobileMenuOpen(false);
  }

  function handleGoHome(): void {
    onGoHome();
    closeMobileMenu();
  }

  function handlePremiumClick(): void {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (hasActiveSubscription) {
      closeMobileMenu();
      return;
    }

    if (onOpenPremium) {
      void onOpenPremium();
    }

    closeMobileMenu();
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

      closeMobileMenu();
      return;
    }

    action();
    closeMobileMenu();
  }

  function handleProfileClick(): void {
    if (onOpenProfile) {
      onOpenProfile();
    }

    closeMobileMenu();
  }

  function handleLogoutClick(): void {
    if (onLogout) {
      void onLogout();
    }

    closeMobileMenu();
  }

  return (
    <header className="sticky top-0 z-[999] border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        {/* LOGO */}
        <button
          type="button"
          onClick={handleGoHome}
          className="flex min-w-0 shrink-0 items-center"
          aria-label="Ir al inicio"
        >
          <img
            src="/ErtzaTest.png"
            alt="ErtzaTest"
            className="h-[36px] w-auto object-contain sm:h-[40px] md:h-[48px]"
          />
        </button>

        {/* MENÚ DESKTOP */}
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          <button type="button" onClick={onOpenTopics}>
            Temas
          </button>

          <button
            type="button"
            onClick={() => handlePremiumProtectedClick(onOpenMockExam)}
          >
            Simulacro {showLocks ? "🔒" : ""}
          </button>

          <button
            type="button"
            onClick={() => handlePremiumProtectedClick(onOpenPanel)}
          >
            Panel {showLocks ? "🔒" : ""}
          </button>

          <button
            type="button"
            onClick={() => handlePremiumProtectedClick(onOpenBadges)}
          >
            Insignias {showLocks ? "🔒" : ""}
          </button>

          <button
            type="button"
            onClick={() => handlePremiumProtectedClick(onOpenRanking)}
          >
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
              type="button"
              onClick={handlePremiumClick}
              className="rounded-xl bg-[#ef4444] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#dc2626]"
            >
              {premiumButtonText}
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={handleProfileClick}
                className="flex-col rounded-xl px-2 py-1 text-right transition hover:bg-[#f8fbff] md:flex"
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
                type="button"
                onClick={handleLogoutClick}
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
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#123b86] bg-white text-3xl font-black leading-none text-[#123b86] shadow-md md:hidden"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {/* OVERLAY MÓVIL */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[998] bg-black/35 md:hidden">
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] overflow-y-auto bg-white px-5 py-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <img
                src="/ErtzaTest.png"
                alt="ErtzaTest"
                className="h-[34px] w-auto object-contain"
              />

              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-3xl font-bold text-slate-700"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            {isLoggedIn && hasActiveSubscription && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                Premium activo ✅
              </div>
            )}

            {isLoggedIn && (
              <button
                type="button"
                onClick={handleProfileClick}
                className="mb-4 block w-full rounded-xl bg-[#f8fbff] px-4 py-3 text-left"
              >
                <span className="block text-xs text-slate-500">
                  Conectado como
                </span>
                <span className="block font-bold text-[#123b86]">
                  {username || "Usuario"}
                </span>
              </button>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  onOpenTopics();
                  closeMobileMenu();
                }}
                className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold text-slate-800"
              >
                Temas
              </button>

              <button
                type="button"
                onClick={() => handlePremiumProtectedClick(onOpenMockExam)}
                className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold text-slate-800"
              >
                Simulacro {showLocks ? "🔒" : ""}
              </button>

              <button
                type="button"
                onClick={() => handlePremiumProtectedClick(onOpenPanel)}
                className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold text-slate-800"
              >
                Panel {showLocks ? "🔒" : ""}
              </button>

              <button
                type="button"
                onClick={() => handlePremiumProtectedClick(onOpenBadges)}
                className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold text-slate-800"
              >
                Insignias {showLocks ? "🔒" : ""}
              </button>

              <button
                type="button"
                onClick={() => handlePremiumProtectedClick(onOpenRanking)}
                className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left font-semibold text-slate-800"
              >
                Ranking {showLocks ? "🔒" : ""}
              </button>

              {!hasActiveSubscription && (
                <button
                  type="button"
                  onClick={handlePremiumClick}
                  className="block w-full rounded-xl bg-[#ef4444] px-4 py-3 text-left font-bold text-white"
                >
                  {premiumButtonText}
                </button>
              )}

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="block w-full rounded-xl bg-slate-800 px-4 py-3 text-left font-bold text-white"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full rounded-xl bg-[#123b86] px-4 py-3 text-center font-bold text-white"
                  onClick={closeMobileMenu}
                >
                  Acceder
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}