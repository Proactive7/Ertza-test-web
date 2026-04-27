import { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  onBack: () => void;
  content: ReactNode;
};

export default function LegalPage({
  title,
  onBack,
  content,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow">
        <button
          onClick={onBack}
          className="mb-6 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Volver
        </button>

        <h1 className="mb-6 text-3xl font-extrabold text-[#1f3762]">
          {title}
        </h1>

        <section>{content}</section>
      </div>
    </main>
  );
}