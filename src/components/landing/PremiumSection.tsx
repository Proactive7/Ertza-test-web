import Benefit from "@/components/ui/Benefit";
import PremiumCard from "@/components/ui/PremiumCard";

export default function PremiumSection() {
  return (
    <section className="border-t border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f5fb_100%)] px-6 py-12 md:px-8 lg:px-10">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_50px_rgba(37,99,235,0.08)]">
          <div className="mb-5 inline-flex rounded-full bg-[#e8f1ff] px-3 py-1 text-sm font-bold text-[#2156b4]">
            Servicio premium
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PremiumCard title="Preparación real" value="Exámenes oficiales" />
            <PremiumCard title="Mejora continua" value="Detecta tus errores" />
            <PremiumCard title="Seguimiento claro" value="Visualiza tu progreso" />
            <PremiumCard title="Ventaja competitiva" value="Las mejores herramientas" />
          </div>

          <div className="mt-6 rounded-2xl bg-[#0f3577] p-5 text-white">
            <p className="text-sm font-semibold text-blue-100">
              Qué desbloquea el plan premium
            </p>
            <ul className="mt-3 space-y-2 text-sm text-blue-50">
              <li>• Simulacros de examen oficiales</li>
              <li>• Corrección de preguntas</li>
              <li>• Ranking con mínimo de 20 tests</li>
              <li>• Estadísticas avanzadas por tema</li>
              <li>• Rachas de tests aprobados</li>
              <li>• Media de resultados y evolución</li>
            </ul>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#2156b4]">
            Preparación completa
          </p>

          <h2 className="mb-5 text-[36px] font-extrabold leading-[1.15] text-[#2a3445] md:text-[50px]">
            Accede a nuestro servicio premium
            <br />
            para una preparación completa y eficaz
          </h2>

          <p className="mb-7 max-w-[640px] text-[18px] leading-[1.7] text-slate-500 md:text-[20px]">
            Lleva tu preparación al siguiente nivel con una plataforma avanzada
            pensada para opositores que quieren entrenar mejor, medir su
            evolución y competir con una ventaja real.
          </p>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <Benefit text="Simulacros de examen completos" />
            <Benefit text="Revisión inteligente de errores" />
            <Benefit text="Ranking de opositores" />
            <Benefit text="Estadísticas detalladas" />
            <Benefit text="Rachas de tests aprobados" />
            <Benefit text="Media de resultados" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() =>
                alert(
                  "La suscripción premium se conectará al sistema de usuarios y pagos en el siguiente paso."
                )
              }
              className="rounded-xl bg-[#ef4444] px-7 py-4 text-base font-bold text-white shadow-[0_16px_30px_rgba(239,68,68,0.28)] transition hover:bg-[#dc2626]"
            >
              Hazte premium
            </button>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
              Suscripción mensual:{" "}
              <span className="font-black text-[#123b86]">9,99 €</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}