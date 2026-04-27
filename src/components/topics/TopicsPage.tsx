import { TOPICS } from "@/data/topics";
import { TopicKey } from "@/types/quiz";

type TopicsPageProps = {
  onBack: () => void;
  onStart: (topicKey: TopicKey) => void;
  hasActiveSubscription?: boolean;
};

export default function TopicsPage({
  onBack,
  onStart,
  hasActiveSubscription = false,
}: TopicsPageProps) {
  function handleSimulacroClick(): void {
    if (!hasActiveSubscription) {
      alert("🔒 El simulacro es exclusivo para usuarios Premium.");
      return;
    }

    onStart("simulacro");
  }

  return (
    <main className="min-h-screen bg-[#d8dde4] px-3 py-4 md:px-4 md:py-5">
      <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[20px] border border-white/60 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
          <button onClick={onBack} aria-label="Volver al inicio">
            <img
              src="/ErtzaTest.png"
              alt="ErtzaTest"
              className="h-[44px] w-auto object-contain md:h-[52px]"
            />
          </button>

          <button
            onClick={onBack}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 md:text-sm"
          >
            Volver
          </button>
        </div>

        {/* HERO */}
        <section className="bg-[linear-gradient(135deg,#0f3577_0%,#184a99_55%,#5f89d8_100%)] px-4 py-6 text-white md:px-6">
          <h1 className="mb-2 text-[24px] font-extrabold md:text-[30px]">
            Test gratuitos
          </h1>

          <p className="max-w-[620px] text-[14px] leading-[1.6] text-blue-100 md:text-[15px]">
            Practica por temas o lanza un simulacro completo con preguntas
            mezcladas.
          </p>
        </section>

        {/* GRID */}
        <section className="px-4 py-6 md:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* TEMAS */}
            {TOPICS.map((topic) => (
              <button
                key={topic.key}
                onClick={() => onStart(topic.key)}
                className="rounded-[16px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 inline-flex rounded-full bg-[#e8f1ff] px-2.5 py-0.5 text-[11px] font-bold text-[#2156b4]">
                  {topic.badge}
                </div>

                <h3 className="mb-2 text-[18px] font-extrabold text-[#1f3762]">
                  {topic.title}
                </h3>

                <p className="mb-3 text-[13px] leading-[1.5] text-slate-500">
                  {topic.description}
                </p>

                <span className="text-[13px] font-bold text-[#2156b4]">
                  Empezar →
                </span>
              </button>
            ))}

            {/* SIMULACRO PREMIUM */}
            <button
              onClick={handleSimulacroClick}
              className={`rounded-[16px] border p-4 text-left shadow-[0_12px_24px_rgba(239,68,68,0.18)] transition hover:-translate-y-0.5 ${
                hasActiveSubscription
                  ? "border-[#f5b4b4] bg-[#ef4444] text-white hover:bg-[#dc2626]"
                  : "border-[#f5b4b4] bg-[#ef4444]/90 text-white opacity-90 hover:bg-[#dc2626]"
              }`}
            >
              <div className="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold">
                Premium {!hasActiveSubscription ? "🔒" : ""}
              </div>

              <h3 className="mb-2 text-[18px] font-extrabold">
                Simulacro {!hasActiveSubscription ? "🔒" : ""}
              </h3>

              <p className="mb-3 text-[13px] leading-[1.5] text-red-100">
                Examen completo con preguntas mezcladas de todos los temas.
              </p>

              <span className="text-[13px] font-bold">
                {hasActiveSubscription ? "Empezar →" : "Bloqueado Premium →"}
              </span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}