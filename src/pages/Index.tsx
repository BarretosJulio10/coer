import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/coer/SiteHeader";
import { SiteFooter } from "@/components/coer/SiteFooter";
import { ApplicationForm } from "@/components/coer/ApplicationForm";
import type { Committee } from "@/lib/committees";

const rules = [
  "Cada comitê tem 2 a 3 membros voluntários, eleitos entre os associados ativos com expertise na área.",
  "Reuniões mensais por videoconferência, com pauta enviada com 3 dias de antecedência.",
  "Cada comitê entrega Relatório Mensal ao Diretor responsável até o 5º dia útil do mês.",
  "O Coordenador do Comitê é eleito pelos próprios membros na primeira reunião.",
  "Todos os candidatos passam por verificação de antecedentes (background check) antes da confirmação.",
  "Mandato dos membros é de 2 anos — renovável.",
];

const Index = () => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase
      .from("committees")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setCommittees((data as Committee[]) ?? []);
        setLoading(false);
      });
  }, []);

  // smooth scroll to hash anchors
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash, loading]);

  const preselected = new URLSearchParams(location.search).get("comite");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative border-b border-hairline">
          <div className="absolute inset-0 watermark opacity-60 pointer-events-none" />
          <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
            <p className="eyebrow">
              Chamada de Voluntários · Junho de 2026 · Campinas/SP
            </p>
            <h1 className="font-serif font-semibold text-ink mt-5 sm:mt-6 leading-[0.98] sm:leading-[0.96] tracking-tight text-[clamp(2rem,8vw,5.25rem)] max-w-[18ch]">
              Comitês Temáticos<br/>
              <span className="italic font-normal text-ink-soft">da COER.</span>
            </h1>
            <div className="rule-gold mt-8 sm:mt-10" />
            <p className="mt-6 sm:mt-8 max-w-[58ch] text-base sm:text-lg leading-relaxed text-ink-soft">
              O que você vai fazer e por que importa. Dez comitês — o coração
              operacional da entidade. As vagas são limitadas. O trabalho é
              voluntário; o impacto é real.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <a href="#comites" className="btn-coer w-full sm:w-auto">Ver os 10 comitês</a>
              <a href="#candidatura" className="btn-coer-outline w-full sm:w-auto">Preencher candidatura</a>
            </div>

            {/* Cabeçalho de documento */}
            <div className="mt-14 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 border-t border-hairline pt-6 sm:pt-8 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
              <div>
                <span className="block text-gold-deep">Documento</span>
                <span className="text-ink">Chamada Oficial · 2026</span>
              </div>
              <div>
                <span className="block text-gold-deep">Sede</span>
                <span className="text-ink">Campinas — São Paulo</span>
              </div>
              <div>
                <span className="block text-gold-deep">Mandato</span>
                <span className="text-ink">2 anos · Renovável</span>
              </div>
            </div>
          </div>
        </section>

        {/* CARTA DO FUNDADOR */}
        <section className="border-b border-hairline">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-20">
            <aside className="lg:sticky lg:top-28 self-start">
              <p className="eyebrow">Carta aberta</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-3 leading-tight">
                Aos colegas do setor.
              </h2>
              <div className="rule-gold mt-6" />
            </aside>
            <div className="prose-editorial max-w-[64ch]">
              <p>
                A COER está sendo fundada e os comitês são o coração operacional
                da entidade. É nos comitês que as coisas acontecem de verdade —
                onde o trabalho é feito, onde o setor avança.
              </p>
              <p>
                Este documento explica em detalhes o que cada comitê faz, o que
                você vai contribuir concretamente e por que cada um deles é
                estratégico para o setor.
              </p>
              <p>
                Leia com atenção. Identifique onde o seu perfil e a sua
                experiência se encaixam. Preencha a ficha e envie para a
                Secretaria.
              </p>
              <p>
                Os comitês têm de 2 a 3 vagas cada. As reuniões são mensais por
                videoconferência. O trabalho é voluntário — mas o impacto é
                real.
              </p>
              <p>
                Juntos somos mais fortes.
              </p>
              <div className="pt-8 mt-2 border-t border-hairline">
                <p className="font-serif text-xl text-ink italic">
                  Douglas Gonçalves Carretero, ASE
                </p>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft mt-1">
                  Um dos Fundadores da COER
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONAM */}
        <section className="border-b border-hairline bg-paper-deep/40">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
            <p className="eyebrow">Capítulo I</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink mt-3 max-w-[20ch] leading-tight">
              Como funcionam<br/>os comitês.
            </h2>
            <div className="rule-gold mt-8" />

            <ol className="mt-10 sm:mt-14 grid md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-8 sm:gap-y-10">
              {rules.map((rule, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start">
                  <span className="font-serif text-2xl sm:text-3xl committee-code leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm sm:text-base text-ink-soft leading-relaxed pt-0.5 sm:pt-1">{rule}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ÍNDICE DOS COMITÊS */}
        <section id="comites" className="scroll-mt-24 border-b border-hairline">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
            <div className="flex items-start sm:items-end justify-between flex-wrap gap-4 sm:gap-6">
              <div>
                <p className="eyebrow">Capítulo II</p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink mt-3">
                  Sumário dos comitês.
                </h2>
              </div>
              <p className="font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft max-w-[28ch] sm:text-right">
                Dez comitês · 20 a 30 vagas no total
              </p>
            </div>
            <div className="rule-gold mt-8" />

            <div className="mt-10 sm:mt-14 border-t-2 border-ink">
              {/* Cabeçalho de tabela tipográfica */}
              <div className="hidden md:grid grid-cols-[64px_1fr_1.2fr_1fr_120px] gap-6 py-3 border-b border-hairline font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
                <span>Cód.</span>
                <span>Comitê</span>
                <span>Reporta-se a</span>
                <span>Dedicação</span>
                <span className="text-right">Detalhe</span>
              </div>
              {committees.map((c) => (
                <Link
                  to={`/comite/${c.code.toLowerCase()}`}
                  key={c.id}
                  className="grid grid-cols-[56px_1fr_auto] md:grid-cols-[64px_1fr_1.2fr_1fr_120px] gap-x-4 gap-y-1 md:gap-6 py-5 md:py-6 border-b border-hairline group hover:bg-card transition-colors md:items-baseline"
                >
                  <span className="committee-code font-serif text-2xl sm:text-3xl md:text-2xl row-span-2 md:row-span-1 self-start">
                    {c.code}
                  </span>
                  <span className="font-serif text-lg sm:text-xl md:text-lg text-ink leading-snug">
                    {c.name.replace(/^Comitê /, "")}
                  </span>
                  <span className="hidden md:block text-sm text-ink-soft">{c.reports_to}</span>
                  <span className="hidden md:block text-sm text-ink-soft">{c.dedication}</span>
                  <span className="md:hidden col-start-2 text-xs text-ink-soft">
                    {c.reports_to} · {c.dedication}
                  </span>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink md:text-right self-start row-start-1 col-start-3 md:row-start-auto md:col-start-auto">
                    Ver →
                    <span className="block h-px bg-gold mt-1 scale-x-0 group-hover:scale-x-100 origin-right transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CANDIDATURA */}
        <section id="candidatura" className="scroll-mt-24 bg-paper-deep/40">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
            <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-20 mb-10 sm:mb-12 items-end">
              <div>
                <p className="eyebrow">Capítulo III</p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink mt-3 leading-tight">
                  Sua candidatura.
                </h2>
                <div className="rule-gold mt-6" />
              </div>
              <p className="text-ink-soft leading-relaxed max-w-[58ch] text-sm sm:text-base">
                Preencha a ficha abaixo. Você pode se candidatar a mais de um
                comitê. A Secretaria conduzirá a verificação de antecedentes e
                encaminhará sua ficha ao Diretor responsável.
              </p>
            </div>

            <ApplicationForm committees={committees} preselectedCode={preselected} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
