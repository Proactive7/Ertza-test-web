type FooterLegalProps = {
  onOpenLegalTerms: () => void;
  onOpenLegalPrivacy: () => void;
  onOpenLegalCookies: () => void;
};

export default function FooterLegal({
  onOpenLegalTerms,
  onOpenLegalPrivacy,
  onOpenLegalCookies,
}: FooterLegalProps) {
  return (
    <footer className="border-t border-slate-100 bg-[#fbfcff] px-6 py-6 md:px-8 lg:px-10">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} ErtzaTest. Todos los derechos reservados.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-600">
          <button onClick={onOpenLegalTerms} className="transition hover:text-[#123b86]">
            Términos legales
          </button>
          <button onClick={onOpenLegalPrivacy} className="transition hover:text-[#123b86]">
            Política de privacidad
          </button>
          <button onClick={onOpenLegalCookies} className="transition hover:text-[#123b86]">
            Política de cookies
          </button>
        </div>
      </div>
    </footer>
  );
}