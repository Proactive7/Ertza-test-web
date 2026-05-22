export default function FeatureStrip() {
  const items = [
    {
      icon: "📘",
      title: "Test Gratuitos",
      text: "Practica por temas con cuestionarios de 40 preguntas y mejora tu base constantemente.",
    },
    {
      icon: "🧪",
      title: "Simulacros",
      text: "Entrena como en una prueba real con exámenes premium mezclados.",
    },
    {
      icon: "📊",
      title: "Dashboard",
      text: "Controla tu evolución con estadísticas y seguimiento del rendimiento.",
    },
    {
      icon: "📄",
      title: "Resultados",
      text: "Revisa errores y detecta rápidamente qué debes reforzar.",
    },
  ];

  return (
    <section className="px-3 py-5 sm:px-6 sm:py-8 md:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="group rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:rounded-[22px] sm:p-6"
          >
            <div className="flex items-start gap-3 sm:block">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-2xl transition group-hover:scale-105 sm:mb-4 sm:h-14 sm:w-14 sm:text-3xl">
                {item.icon}
              </div>

              <div className="min-w-0">
                <h3 className="mb-1 text-[17px] font-black leading-tight text-[#1f3762] sm:mb-3 sm:text-xl">
                  {item.title}
                </h3>

                <p className="text-[13px] leading-6 text-slate-500 sm:text-[15px] sm:leading-7">
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}