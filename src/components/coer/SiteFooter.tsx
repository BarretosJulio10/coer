import { Logo } from "./Logo";

export const SiteFooter = () => {
  return (
    <footer className="mt-20 sm:mt-28 lg:mt-32 border-t border-hairline bg-primary text-primary-foreground">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16 grid gap-10 lg:gap-12 lg:grid-cols-[1fr_2fr] items-start">
        <div className="flex flex-col gap-5">
          <div className="bg-paper/95 inline-flex p-4 self-start rounded-sm">
            <Logo variant="compact" />
          </div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-paper/70 max-w-[36ch]">
            Associação Nacional de Cooperação em Rastreamento, Monitoramento, Pronta Resposta e Gerenciamento de Riscos
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mb-3">
              Sede
            </p>
            <p className="font-serif text-lg leading-snug">Campinas — São Paulo</p>
            <p className="text-sm text-paper/70 mt-1">Brasil</p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mb-3">
              Secretaria
            </p>
            <a
              href="mailto:secretaria@coer.org.br"
              className="font-serif text-base sm:text-lg leading-snug hover:text-gold transition-colors break-anywhere"
            >
              secretaria@coer.org.br
            </a>
            <p className="text-sm text-paper/70 mt-1">coer.org.br</p>
          </div>
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold mb-3">
              Lema
            </p>
            <p className="font-serif text-base sm:text-lg leading-snug italic">
              "O setor que move o Brasil. A entidade que o representa."
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 font-mono text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.18em] text-paper/55">
          <span>© 2026 COER · Documento institucional</span>
          <span>Junho de 2026 · Campinas/SP</span>
        </div>
      </div>
    </footer>
  );
};