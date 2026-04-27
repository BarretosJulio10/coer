import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/coer/SiteHeader";
import { SiteFooter } from "@/components/coer/SiteFooter";
import type { Committee } from "@/lib/committees";

const CommitteeDetail = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!codigo) return;
    supabase
      .from("committees")
      .select("*")
      .ilike("code", codigo)
      .maybeSingle()
      .then(({ data }) => {
        setCommittee(data as Committee | null);
        setLoading(false);
      });
  }, [codigo]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-[1240px] mx-auto px-6 lg:px-10 py-24">
          <p className="font-mono text-sm text-ink-soft">Carregando…</p>
        </main>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-[1240px] mx-auto px-6 lg:px-10 py-24">
          <p className="eyebrow">Comitê não encontrado</p>
          <h1 className="font-serif text-4xl text-ink mt-4">Esta página não existe.</h1>
          <button onClick={() => navigate("/#comites")} className="btn-coer mt-8">
            Voltar ao sumário
          </button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 lg:pb-24">
          <Link
            to="/#comites"
            className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft hover:text-ink transition-colors"
          >
            ← Sumário dos comitês
          </Link>

          <header className="mt-8 sm:mt-10 grid lg:grid-cols-[200px_1fr] gap-6 sm:gap-10 items-start border-b border-hairline pb-10 sm:pb-12">
            <div>
              <p className="eyebrow">Comitê</p>
              <p className="committee-code font-serif text-[clamp(3.5rem,14vw,6.5rem)] leading-none mt-2 break-anywhere">
                {committee.code}
              </p>
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight break-anywhere">
                {committee.name}
              </h1>
              <div className="rule-gold mt-6" />
              <dl className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 font-mono text-[0.7rem] uppercase tracking-[0.18em]">
                <Meta label="Reporta-se a" value={committee.reports_to} />
                <Meta label="Vagas" value={committee.vacancies} />
                <Meta label="Dedicação" value={committee.dedication} />
              </dl>
            </div>
          </header>

          <section className="mt-12 sm:mt-16 grid lg:grid-cols-[200px_1fr] gap-6 sm:gap-10">
            <p className="eyebrow lg:pt-2">§ 1 — Por que existe</p>
            <div className="prose-editorial max-w-[68ch]">
              <p>{committee.why_exists}</p>
            </div>
          </section>

          <section className="mt-14 sm:mt-20 grid lg:grid-cols-[200px_1fr] gap-6 sm:gap-10">
            <p className="eyebrow lg:pt-2">§ 2 — O que você fará</p>
            <ol className="grid gap-6 max-w-[68ch] border-t border-hairline">
              {committee.activities.map((act, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-4 sm:gap-6 pt-5 sm:pt-6 border-b border-hairline pb-5 sm:pb-6 last:border-b-0">
                  <span className="font-serif text-xl sm:text-2xl committee-code leading-none w-9 sm:w-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm sm:text-base text-ink-soft leading-relaxed">{act}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-14 sm:mt-20 border-t border-hairline pt-8 sm:pt-10 flex flex-col sm:flex-row flex-wrap gap-4 sm:items-center sm:justify-between">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft max-w-[40ch]">
              Mandato de 2 anos · Verificação de antecedentes obrigatória
            </p>
            <Link
              to={`/?comite=${committee.code}#candidatura`}
              className="btn-coer w-full sm:w-auto"
            >
              Candidatar-se ao {committee.code}
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-gold-deep mb-1">{label}</dt>
    <dd className="text-ink normal-case tracking-normal font-sans text-sm">{value}</dd>
  </div>
);

export default CommitteeDetail;