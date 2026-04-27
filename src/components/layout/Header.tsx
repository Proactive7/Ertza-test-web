"use client";

import Link from "next/link";

type HeaderProps = {
  onGoHome: () => void;
  onOpenTopics: () => void;
  onOpenPanel: () => void;
  onOpenBadges: () => void;
  onOpenMockExam: () => void;
  onOpenRanking: () => void;

  username?: string | null;
  isLoggedIn?: boolean;
  hasActiveSubscription?: boolean;
  onLogout?: () => void | Promise<void>;
};

export default function Header({
  onGoHome,
  onOpenTopics,
  onOpenPanel,
  onOpenBadges,
  onOpenMockExam,
  onOpenRanking,
  username,
  isLoggedIn = false,
  hasActiveSubscription = false,
  onLogout,
}: HeaderProps) {
  const showLocks = isLoggedIn && !hasActiveSubscription;

  function handlePremiumClick(): void {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    alert("Ir a pasarela de pago (Stripe próximamente)");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
      {/* LOGO */}
      <button onClick={onGoHome} className="flex items-center">
        <img
          src="/ErtzaTest.png"
          alt="ErtzaTest"
          className="h-[48px] w-auto object-contain"
        />
      </button>

      {/* MENÚ */}
      <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
        <button onClick={onOpenTopics}>Temas</button>

        <button onClick={onOpenMockExam}>
          Simulacro {showLocks ? "🔒" : ""}
        </button>

        <button onClick={onOpenPanel}>
          Panel {showLocks ? "🔒" : ""}
        </button>

        <button onClick={onOpenBadges}>
          Insignias {showLocks ? "🔒" : ""}
        </button>

        <button onClick={onOpenRanking}>
          Ranking {showLocks ? "🔒" : ""}
        </button>
      </nav>

      {/* DERECHA */}
      <div className="flex items-center gap-3">
        {/* PREMIUM */}
        {isLoggedIn && hasActiveSubscription ? (
          <span className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
            Premium activo ✅
          </span>
        ) : (
          <button
            onClick={handlePremiumClick}
            className="rounded-xl bg-[#ef4444] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#dc2626]"
          >
            Premium
          </button>
        )}

        {/* LOGIN / USER */}
        {isLoggedIn ? (
          <>
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-xs text-slate-500">Conectado como</span>
              <span className="text-sm font-bold text-[#123b86]">
                {username}
              </span>
            </div>

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
            className="rounded-xl bg-[#123b86] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f3577]"
          >
            Acceder
          </Link>
        )}
      </div>
    </header>
  );
}