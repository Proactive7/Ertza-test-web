import FeatureLine from "@/components/ui/FeatureLine";
import StatMini from "@/components/ui/StatMini";
import TimelineItem from "@/components/ui/TimelineItem";

export default function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -left-6 top-10 hidden h-40 w-28 rounded-[22px] border-[6px] border-[#244f97] bg-[#edf3fd] shadow-2xl lg:block">
        <div className="px-3 pt-4">
          <div className="mb-3 h-2.5 w-14 rounded bg-slate-300" />
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-[11px] font-bold text-green-600">
                  ✓
                </div>
                <div className="h-2.5 flex-1 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute left-10 top-28 hidden h-28 w-16 rounded-[16px] border-[5px] border-[#9eb9ea] bg-white shadow-xl lg:block">
        <div className="px-2 pt-3">
          <div className="mx-auto mb-3 h-1.5 w-7 rounded bg-slate-200" />
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-lg text-pink-500">
            ✓
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-2 rounded bg-pink-200" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative ml-auto max-w-[500px] rounded-[30px] border border-white/10 bg-white/10 p-4 shadow-[0_25px_60px_rgba(15,53,119,0.22)] backdrop-blur-md">
        <div className="rounded-[24px] bg-white p-5 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Panel del opositor
              </p>
              <h3 className="text-[28px] font-black tracking-tight text-[#123b86]">
                ErtzaTest
              </h3>
            </div>

            <div className="rounded-full bg-[#e8f1ff] px-3 py-1 text-sm font-bold text-[#2156b4]">
              Premium
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-[#f8fbff] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  Nota media
                </span>
                <span className="text-xl font-black text-[#123b86]">31.4</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200">
                <div className="h-3 w-[78%] rounded-full bg-[linear-gradient(90deg,#1d4ed8,#3b82f6)]" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatMini title="Racha actual" value="12 días" />
              <StatMini title="Ranking" value="Top 18" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatMini title="Tests aprobados" value="26" />
              <StatMini title="Media global" value="7.8 / 10" />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-500">
                Funciones premium
              </p>
              <div className="space-y-3 text-sm text-slate-700">
                <FeatureLine text="Simulacros de examen completos" />
                <FeatureLine text="Ranking de opositores" />
                <FeatureLine text="Estadísticas avanzadas" />
                <FeatureLine text="Rachas de tests aprobados" />
                <FeatureLine text="Media de resultados" />
                <FeatureLine text="Revisión de preguntas falladas" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-500">
                Actividad reciente
              </p>
              <div className="space-y-3">
                <TimelineItem title="Constitución" score="34 / 40" status="Aprobado" />
                <TimelineItem title="Derecho Penal" score="28 / 40" status="En progreso" />
                <TimelineItem title="Igualdad" score="31 / 40" status="Aprobado" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}