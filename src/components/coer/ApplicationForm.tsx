import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Committee } from "@/lib/committees";

const schema = z.object({
  full_name: z.string().trim().min(3, "Informe seu nome completo").max(120),
  company: z.string().trim().min(2, "Informe a empresa").max(160),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(25),
  email: z.string().trim().email("E-mail inválido").max(180),
  experience: z.string().trim().min(20, "Descreva brevemente sua experiência").max(2000),
  hours_per_week: z.enum(["1-2", "2-3", "3+"], { required_error: "Selecione uma opção" }),
  prior_participation: z.enum(["sim", "nao"], { required_error: "Selecione uma opção" }),
  prior_participation_details: z.string().trim().max(300).optional(),
  motivation: z.string().trim().max(2000).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "É necessário confirmar o aceite" }),
  }),
  committee_ids: z.array(z.string().uuid()).min(1, "Selecione ao menos um comitê"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  committees: Committee[];
  preselectedCode?: string | null;
}

export const ApplicationForm = ({ committees, preselectedCode }: Props) => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      company: "",
      whatsapp: "",
      email: "",
      experience: "",
      prior_participation_details: "",
      motivation: "",
      committee_ids: [],
    },
  });

  const selected = watch("committee_ids") || [];
  const priorParticipation = watch("prior_participation");

  useEffect(() => {
    if (preselectedCode && committees.length) {
      const found = committees.find((c) => c.code === preselectedCode);
      if (found) {
        setValue("committee_ids", [found.id], { shouldValidate: true });
      }
    }
  }, [preselectedCode, committees, setValue]);

  const toggleCommittee = (id: string) => {
    const set = new Set(selected);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setValue("committee_ids", Array.from(set), { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { data, error } = await supabase.functions.invoke("submit-application", {
        body: {
          full_name: values.full_name,
          company: values.company,
          whatsapp: values.whatsapp,
          email: values.email,
          experience: values.experience,
          hours_per_week: values.hours_per_week,
          prior_participation: values.prior_participation === "sim",
          prior_participation_details:
            values.prior_participation === "sim"
              ? values.prior_participation_details ?? null
              : null,
          motivation: values.motivation || null,
          committee_ids: values.committee_ids,
        },
      });

      if (error) throw error;
      if (data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }

      setSubmitted(true);
      reset();
      toast.success("Candidatura recebida pela Secretaria.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar";
      toast.error(msg);
    }
  };

  if (submitted) {
    return (
      <div className="border border-hairline bg-card p-10 lg:p-14 text-center">
        <p className="eyebrow mb-4">Candidatura recebida</p>
        <h3 className="font-serif text-3xl text-ink mb-4">
          Sua ficha foi registrada.
        </h3>
        <div className="rule-gold mx-auto my-6" />
        <p className="text-ink-soft max-w-[52ch] mx-auto leading-relaxed">
          A Secretaria da COER recebeu sua candidatura. Você receberá um retorno
          pelo e-mail informado após a verificação de antecedentes e análise do
          Diretor responsável pelo comitê escolhido.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn-coer-outline mt-8"
        >
          Enviar nova candidatura
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border border-hairline bg-card"
    >
      <div className="border-b border-hairline px-5 sm:px-8 lg:px-12 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-3">
        <div>
          <p className="eyebrow">Anexo I</p>
          <h3 className="font-serif text-xl sm:text-2xl text-ink mt-1">Ficha de Candidatura</h3>
        </div>
        <p className="font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft break-anywhere">
          Enviar para: secretaria@coer.org.br
        </p>
      </div>

      <div className="px-5 sm:px-8 lg:px-12 py-8 sm:py-10 grid gap-7 sm:gap-8">
        {/* Identificação */}
        <fieldset className="grid gap-6">
          <legend className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-gold-deep">
            § 1 — Identificação
          </legend>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            <Field label="Nome completo" error={errors.full_name?.message}>
              <input className="coer-input" {...register("full_name")} />
            </Field>
            <Field label="Empresa / Razão Social" error={errors.company?.message}>
              <input className="coer-input" {...register("company")} />
            </Field>
            <Field label="WhatsApp" error={errors.whatsapp?.message}>
              <input
                className="coer-input"
                placeholder="(11) 9 0000-0000"
                {...register("whatsapp")}
              />
            </Field>
            <Field label="E-mail corporativo" error={errors.email?.message}>
              <input className="coer-input" type="email" {...register("email")} />
            </Field>
          </div>
        </fieldset>

        <Divider />

        {/* Comitês */}
        <fieldset className="grid gap-4">
          <legend className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-gold-deep">
            § 2 — Comitês de interesse
          </legend>
          <p className="text-sm text-ink-soft">
            Você pode marcar mais de um comitê. Cada candidatura passa por
            verificação de antecedentes e análise do Diretor responsável.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {committees.map((c) => {
              const checked = selected.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 border px-3 sm:px-4 py-3 cursor-pointer transition-colors ${
                    checked
                      ? "border-primary bg-primary/[0.04]"
                      : "border-hairline hover:border-ink-soft/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCommittee(c.id)}
                    className="mt-1 accent-primary"
                  />
                  <span className="grid min-w-0">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-gold-deep">
                      {c.code}
                    </span>
                    <span className="font-serif text-sm sm:text-base text-ink leading-snug break-anywhere">
                      {c.name.replace(/^Comit[êe] (de |Editorial|Pedagógico|Regulatório)?/i, "").trim() || c.name}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.committee_ids && (
            <p className="text-sm text-destructive">{errors.committee_ids.message as string}</p>
          )}
        </fieldset>

        <Divider />

        {/* Disponibilidade & experiência */}
        <fieldset className="grid gap-6">
          <legend className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-gold-deep">
            § 3 — Experiência e disponibilidade
          </legend>

          <Field label="Minha experiência nesta área" error={errors.experience?.message}>
            <textarea
              rows={4}
              className="coer-input"
              {...register("experience")}
              placeholder="Descreva brevemente sua trajetória relacionada ao(s) comitê(s) escolhido(s)."
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label>Horas disponíveis por semana</Label>
              <div className="grid gap-2">
                {[
                  { v: "1-2", l: "1 a 2 horas" },
                  { v: "2-3", l: "2 a 3 horas" },
                  { v: "3+", l: "Mais de 3 horas" },
                ].map((opt) => (
                  <label key={opt.v} className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="radio"
                      value={opt.v}
                      {...register("hours_per_week")}
                      className="accent-primary"
                    />
                    {opt.l}
                  </label>
                ))}
              </div>
              {errors.hours_per_week && (
                <p className="text-sm text-destructive mt-1">{errors.hours_per_week.message}</p>
              )}
            </div>

            <div>
              <Label>Já participei de associações ou entidades do setor</Label>
              <div className="grid gap-2">
                <label className="flex items-center gap-3 text-sm text-ink">
                  <input type="radio" value="sim" {...register("prior_participation")} className="accent-primary" />
                  Sim
                </label>
                <label className="flex items-center gap-3 text-sm text-ink">
                  <input type="radio" value="nao" {...register("prior_participation")} className="accent-primary" />
                  Não — será minha primeira participação
                </label>
              </div>
              {priorParticipation === "sim" && (
                <input
                  className="coer-input mt-3"
                  placeholder="Qual entidade?"
                  {...register("prior_participation_details")}
                />
              )}
              {errors.prior_participation && (
                <p className="text-sm text-destructive mt-1">
                  {errors.prior_participation.message}
                </p>
              )}
            </div>
          </div>

          <Field label="Por que quero fazer parte (opcional)">
            <textarea
              rows={3}
              className="coer-input"
              {...register("motivation")}
              placeholder="Espaço opcional para uma breve carta de intenção."
            />
          </Field>
        </fieldset>

        <Divider />

        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" {...register("consent")} className="mt-1 accent-primary" />
          <span>
            Estou ciente de que candidatos passam por verificação de antecedentes
            (background check) antes da confirmação e que o mandato de membro de
            comitê é de 2 anos, renovável. Concordo com o envio dos meus dados
            para fins exclusivos desta candidatura.
          </span>
        </label>
        {errors.consent && (
          <p className="text-sm text-destructive">{errors.consent.message as string}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 pt-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft">
            Vagas: 2 a 3 por comitê · Reuniões mensais por videoconferência
          </p>
          <button type="submit" disabled={isSubmitting} className="btn-coer disabled:opacity-60 w-full sm:w-auto">
            {isSubmitting ? "Enviando…" : "Enviar candidatura"}
          </button>
        </div>
      </div>

      <style>{`
        .coer-input {
          width: 100%;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--hairline));
          padding: 0.7rem 0.9rem;
          font-size: 0.95rem;
          color: hsl(var(--ink));
          font-family: 'Inter', sans-serif;
          transition: border-color .15s ease, box-shadow .15s ease;
          border-radius: 2px;
        }
        .coer-input:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--gold) / 0.18);
        }
      `}</style>
    </form>
  );
};

const Field = ({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <Label>{label}</Label>
    {children}
    {error && <p className="text-sm text-destructive mt-1">{error}</p>}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft mb-2">
    {children}
  </label>
);

const Divider = () => <div className="h-px bg-hairline" />;