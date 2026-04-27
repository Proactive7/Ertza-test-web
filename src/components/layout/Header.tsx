type HeaderProps = {
  onGoHome: () => void;
  onOpenTopics: () => void;
  onOpenPanel: () => void;
  onOpenBadges: () => void;
  onOpenMockExam: () => void;
};

export default function Header({
  onGoHome,
  onOpenTopics,
  onOpenPanel,
  onOpenBadges,
  onOpenMockExam,
}: HeaderProps) {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-8 lg:px-10">
      <button
        onClick={onGoHome}
        className="group flex items-center text-left"
        aria-label="Volver al inicio"
      >
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-xl transition group-hover:bg-blue-500/25" />
          <img
            src="/ErtzaTest.png"
            alt="ErtzaTest"
            className="relative h-[54px] w-auto bg-transparent object-contain mix-blend-multiply md:h-[64px]"
          />
        </div>
      </button>

      <nav className="hidden items-center gap-8 lg:flex">
        <button
          onClick={onOpenPanel}
          className="text-sm font-semibold text-slate-500 transition hover:text-[#123b86]"
        >
          Panel del opositor
        </button>

        <button
          onClick={onOpenTopics}
          className="text-sm font-semibold text-slate-500 transition hover:text-[#123b86]"
        >
          Test Gratuitos
        </button>

        <button
          onClick={onOpenMockExam}
          className="text-sm font-semibold text-slate-500 transition hover:text-[#123b86]"
        >
          Simulacro
        </button>

        <button
          onClick={onOpenBadges}
          className="text-sm font-semibold text-slate-500 transition hover:text-[#123b86]"
        >
          Insignias
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => alert("El sistema de login y registro real será el siguiente paso.")}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Login
        </button>

        <button
          onClick={() =>
            alert("La suscripción premium se conectará con login y pagos en el siguiente paso.")
          }
          className="rounded-xl bg-[#ef4444] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(239,68,68,0.28)] transition hover:bg-[#dc2626]"
        >
          Suscríbete
        </button>
      </div>
    </header>
  );
}