export default function FeatureStrip() {
  const items = [
    {
      icon: "📘",
      title: "Test Gratuitos",
      text: "Practica por temas con cuestionarios de 40 preguntas y mejora tu base de forma constante.",
    },
    {
      icon: "🧪",
      title: "Simulacros de Examen",
      text: "Entrena como en una prueba real con exámenes premium de preguntas mezcladas.",
    },
    {
      icon: "📊",
      title: "Dashboard Personalizado",
      text: "Controla tu evolución con estadísticas, rachas, medias y seguimiento del rendimiento.",
    },
    {
      icon: "📄",
      title: "Resultados Detallados",
      text: "Consulta tus errores, revisa tus respuestas y detecta con claridad qué debes reforzar.",
    },
  ];

  return (
    <section className="px-6 py-10 md:px-8 lg:px-10">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-3xl">
              {item.icon}
            </div>
            <h3 className="mb-3 text-xl font-black leading-tight text-[#1f3762]">
              {item.title}
            </h3>
            <p className="text-[15px] leading-7 text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}