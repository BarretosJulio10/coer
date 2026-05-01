  const printApplication = (app: AdminApplication) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const committeesHtml = app.committees
      .map(c => `<li><strong>${c.code}</strong> — ${c.name}</li>`)
      .join('');

    const photoHtml = app.photo_url 
      ? `<img src="${app.photo_url}" style="width: 120px; height: 160px; object-fit: cover; border: 1px solid #d1d1d1;">`
      : `<div style="width: 120px; height: 160px; border: 1px solid #d1d1d1; background: #f9f9f9; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">SEM FOTO</div>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha - ${app.full_name}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; font-size: 12px; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { font-family: serif; font-size: 26px; margin: 0; }
          .header p { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
          .photo-section { float: right; margin-left: 20px; margin-bottom: 20px; }
          .section { margin-bottom: 25px; clear: both; }
          .section-title { font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 1.5px; color: #b8860b; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; }
          .field-label { color: #666; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
          .field-value { font-size: 12px; color: #1a1a1a; }
          ul { padding-left: 18px; margin: 0; list-style-type: square; }
          li { margin-bottom: 6px; }
          .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; font-size: 9px; color: #999; text-align: center; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #f4f4f4; padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">
          <button onclick="window.print()" style="padding: 8px 16px; cursor: pointer;">Imprimir Ficha (A4)</button>
        </div>
        <div style="padding: 20px;">
          <div class="header">
            <div>
              <p>Confederação de Entidades e Representações</p>
              <h1>Ficha de Candidatura</h1>
            </div>
            <p>ID: ${app.id.slice(0, 8)}</p>
          </div>

          <div class="photo-section">
            ${photoHtml}
          </div>

          <div class="section">
            <div class="section-title">§ 1 — Identificação</div>
            <div class="grid">
              <div>
                <div class="field-label">Nome Completo</div>
                <div class="field-value">${app.full_name}</div>
              </div>
              <div>
                <div class="field-label">Empresa / Razão Social</div>
                <div class="field-value">${app.company}</div>
              </div>
              <div>
                <div class="field-label">WhatsApp</div>
                <div class="field-value">${app.whatsapp}</div>
              </div>
              <div>
                <div class="field-label">E-mail Corporativo</div>
                <div class="field-value">${app.email}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">§ 2 — Comitês de Interesse</div>
            <ul>${committeesHtml}</ul>
          </div>

          <div class="section">
            <div class="section-title">§ 3 — Experiência e Disponibilidade</div>
            <div class="grid">
              <div>
                <div class="field-label">Disponibilidade Semanal</div>
                <div class="field-value">${app.hours_per_week} horas</div>
              </div>
              <div>
                <div class="field-label">Participação Anterior</div>
                <div class="field-value">${app.prior_participation ? 'Sim' : 'Não'} ${app.prior_participation_details ? `— ${app.prior_participation_details}` : ''}</div>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <div class="field-label">Relato de Experiência</div>
              <div class="field-value" style="white-space: pre-wrap;">${app.experience}</div>
            </div>
          </div>

          ${app.motivation ? `
          <div class="section">
            <div class="section-title">Motivação / Intenção</div>
            <div class="field-value" style="font-style: italic; white-space: pre-wrap;">${app.motivation}</div>
          </div>
          ` : ''}

          <div class="footer">
            COER — Documento Oficial da Secretaria Geral · Gerado em ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/coer/SiteHeader";
import { SiteFooter } from "@/components/coer/SiteFooter";
import { toast } from "sonner";

type Status = "pendente" | "em_analise" | "aprovado" | "rejeitado";

interface AdminApplication {
  id: string;
  full_name: string;
  company: string;
  whatsapp: string;
  email: string;
  experience: string;
  hours_per_week: string;
  prior_participation: boolean;
  prior_participation_details: string | null;
  motivation: string | null;
  status: Status;
  internal_notes: string | null;
  created_at: string;
  photo_url: string | null;
  committees: { code: string; name: string }[];
}

const STATUS_LABELS: Record<Status, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const TOKEN_KEY = "coer_admin_token";

const Admin = () => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [filterCommittee, setFilterCommittee] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async (tk: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-list-applications",
        { headers: { "x-admin-token": tk } },
      );
      if (error) throw error;
      setApps((data as { applications: AdminApplication[] }).applications);
    } catch (e) {
      toast.error("Não foi possível carregar candidaturas.");
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-login", {
        body: { password },
      });
      if (error) throw error;
      const tk = (data as { token: string }).token;
      sessionStorage.setItem(TOKEN_KEY, tk);
      setToken(tk);
      setPassword("");
    } catch {
      toast.error("Senha incorreta.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const allCommittees = useMemo(() => {
    const set = new Map<string, string>();
    apps.forEach((a) => a.committees.forEach((c) => set.set(c.code, c.name)));
    return Array.from(set.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [apps]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterCommittee !== "all" && !a.committees.some((c) => c.code === filterCommittee)) return false;
      return true;
    });
  }, [apps, filterStatus, filterCommittee]);

  const updateApp = async (id: string, patch: Partial<{ status: Status; internal_notes: string }>) => {
    if (!token) return;
    try {
      const { error } = await supabase.functions.invoke("admin-update-application", {
        headers: { "x-admin-token": token },
        body: { id, ...patch },
      });
      if (error) throw error;
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      toast.success("Atualizado.");
    } catch {
      toast.error("Falha ao atualizar.");
    }
  };

  const deleteApp = async (id: string) => {
    if (!token) return;
    try {
      const { error } = await supabase.functions.invoke("admin-delete-application", {
        headers: { "x-admin-token": token },
        body: { id },
      });
      if (error) throw error;
      setApps((prev) => prev.filter((a) => a.id !== id));
      setOpenId(null);
      toast.success("Candidatura excluída.");
    } catch {
      toast.error("Falha ao excluir.");
    }
  };

  const exportCsv = async () => {
    if (!token) return;
    try {
      const url = `https://bnuadaqkcwefdknpdqyl.supabase.co/functions/v1/admin-export-csv`;
      const res = await fetch(url, { headers: { "x-admin-token": token } });
      if (!res.ok) throw new Error("falha");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `coer-candidaturas-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Falha ao exportar.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 grid place-items-center px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md border border-hairline bg-card p-6 sm:p-10"
          >
            <p className="eyebrow">Acesso restrito</p>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink mt-3">Secretaria COER</h1>
            <div className="rule-gold mt-5" />
            <p className="text-sm text-ink-soft mt-5 sm:mt-6 leading-relaxed">
              Painel interno da COER. Informe a senha da Secretaria para acessar
              as candidaturas recebidas.
            </p>
            <label className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft mt-7 sm:mt-8 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-hairline px-4 py-3 bg-background text-ink focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--gold)/0.18)]"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-coer w-full mt-6 disabled:opacity-60"
            >
              {loginLoading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const open = apps.find((a) => a.id === openId) ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6 border-b border-hairline pb-6 sm:pb-8">
            <div>
              <p className="eyebrow">Painel da Secretaria</p>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-3">Candidaturas</h1>
              <p className="text-ink-soft mt-2 text-sm">
                {apps.length} candidatura{apps.length === 1 ? "" : "s"} registrada{apps.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportCsv} className="btn-coer-outline flex-1 sm:flex-none">Exportar CSV</button>
              <button onClick={logout} className="btn-coer-outline flex-1 sm:flex-none">Sair</button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-6 sm:mt-8 grid sm:flex sm:flex-wrap gap-4 sm:gap-6 sm:items-end">
            <div className="min-w-0">
              <label className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | Status)}
                className="w-full sm:w-auto border border-hairline px-3 py-2 bg-background text-ink"
              >
                <option value="all">Todos</option>
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft mb-2">
                Comitê
              </label>
              <select
                value={filterCommittee}
                onChange={(e) => setFilterCommittee(e.target.value)}
                className="w-full sm:min-w-[220px] border border-hairline px-3 py-2 bg-background text-ink"
              >
                <option value="all">Todos</option>
                {allCommittees.map(([code, name]) => (
                  <option key={code} value={code}>{code} — {name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela */}
          <div className="mt-8 sm:mt-10 border-t-2 border-ink">
            <div className="hidden lg:grid grid-cols-[110px_1.4fr_1.2fr_1fr_1.4fr_120px] gap-4 py-3 border-b border-hairline font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
              <span>Data</span>
              <span>Candidato</span>
              <span>Empresa</span>
              <span>Status</span>
              <span>Comitês</span>
              <span className="text-right">Ação</span>
            </div>

            {loading ? (
              <p className="py-10 text-sm text-ink-soft">Carregando…</p>
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-ink-soft">
                Nenhuma candidatura encontrada.
              </p>
            ) : (
              filtered.map((a) => (
                <div
                  key={a.id}
                  className="grid lg:grid-cols-[110px_1.4fr_1.2fr_1fr_1.4fr_120px] gap-y-2 lg:gap-x-4 py-5 border-b border-hairline lg:items-baseline"
                >
                  {/* Mobile-first: candidato e ação no topo */}
                  <div className="flex items-start justify-between gap-3 lg:contents">
                    <span className="font-mono text-xs text-ink-soft lg:order-none">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <button
                      onClick={() => setOpenId(a.id)}
                      className="lg:hidden font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink hover:text-gold-deep whitespace-nowrap"
                    >
                      Detalhar →
                    </button>
                  </div>
                  <span className="min-w-0">
                    <span className="block font-serif text-base sm:text-lg text-ink break-anywhere">{a.full_name}</span>
                    <span className="block text-xs text-ink-soft break-anywhere">{a.email}</span>
                  </span>
                  <span className="text-sm text-ink break-anywhere">
                    <span className="lg:hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft mr-2">Empresa:</span>
                    {a.company}
                  </span>
                  <span className="self-start"><StatusBadge status={a.status} /></span>
                  <span className="text-xs text-ink-soft">
                    <span className="lg:hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft mr-2">Comitês:</span>
                    {a.committees.map((c) => c.code).join(" · ") || "—"}
                  </span>
                  <button
                    onClick={() => setOpenId(a.id)}
                    className="hidden lg:block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink hover:text-gold-deep lg:text-right"
                  >
                    Detalhar →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {open && (
        <DetailDrawer
          app={open}
          onClose={() => setOpenId(null)}
          onUpdate={updateApp}
          onDelete={deleteApp}
          onPrint={printApplication}
        />
      )}

      <SiteFooter />
    </div>
  );
};

const StatusBadge = ({ status }: { status: Status }) => {
  const colors: Record<Status, string> = {
    pendente: "border-ink-soft/40 text-ink-soft",
    em_analise: "border-gold text-gold-deep",
    aprovado: "border-primary text-primary",
    rejeitado: "border-destructive text-destructive",
  };
  return (
    <span className={`inline-block border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
};

const DetailDrawer = ({
  app, onClose, onUpdate, onDelete, onPrint,
}: {
  app: AdminApplication;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<{ status: Status; internal_notes: string }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPrint: (app: AdminApplication) => void;
}) => {
  const [notes, setNotes] = useState(app.internal_notes ?? "");
  const [status, setStatus] = useState<Status>(app.status);

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-paper h-full overflow-y-auto border-l border-hairline"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-paper border-b border-hairline px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Candidatura</p>
            <h2 className="font-serif text-xl sm:text-2xl text-ink mt-1 break-anywhere">{app.full_name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onPrint(app)}
              className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-primary hover:text-gold-deep whitespace-nowrap border border-primary/20 px-3 py-1.5 hover:bg-primary/5 transition-colors"
            >
              Imprimir (PDF)
            </button>
            <button
              onClick={onClose}
              className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft hover:text-ink whitespace-nowrap"
            >
              Fechar ✕
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8 grid gap-7 sm:gap-8">
          <Section title="Identificação">
            {app.photo_url && (
              <div className="mb-4">
                <p className="text-ink-soft text-xs uppercase tracking-wider mb-2">Foto do Candidato</p>
                <img 
                  src={app.photo_url} 
                  alt={app.full_name} 
                  className="w-32 h-40 object-cover border border-hairline shadow-sm"
                />
              </div>
            )}
            <Row k="Empresa" v={app.company} />
            <Row k="WhatsApp" v={app.whatsapp} />
            <Row k="E-mail" v={app.email} />
            <Row k="Recebida em" v={new Date(app.created_at).toLocaleString("pt-BR")} />
          </Section>

          <Section title="Comitês escolhidos">
            <ul className="grid gap-2">
              {app.committees.map((c) => (
                <li key={c.code} className="flex gap-3 items-baseline">
                  <span className="committee-code font-serif text-lg w-10">{c.code}</span>
                  <span className="text-ink">{c.name}</span>
                </li>
              ))}
              {app.committees.length === 0 && (
                <li className="text-ink-soft text-sm">Nenhum comitê vinculado.</li>
              )}
            </ul>
          </Section>

          <Section title="Disponibilidade">
            <Row k="Horas/semana" v={app.hours_per_week} />
            <Row k="Já participou de entidades" v={app.prior_participation ? `Sim — ${app.prior_participation_details ?? ""}` : "Não — primeira participação"} />
          </Section>

          <Section title="Experiência">
            <p className="text-ink-soft leading-relaxed whitespace-pre-wrap">{app.experience}</p>
          </Section>

          {app.motivation && (
            <Section title="Motivação">
              <p className="text-ink-soft leading-relaxed whitespace-pre-wrap italic">{app.motivation}</p>
            </Section>
          )}

          <div className="border-t border-hairline pt-6 grid gap-5">
            <p className="eyebrow">Gestão da Secretaria</p>
            <div>
              <label className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="border border-hairline px-3 py-2 bg-background text-ink w-full"
              >
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft mb-2">
                Notas internas
              </label>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-hairline px-3 py-2 bg-background text-ink"
              />
            </div>
            <button
              onClick={async () => {
                await onUpdate(app.id, { status, internal_notes: notes });
              }}
              className="btn-coer w-full sm:w-auto sm:self-start"
            >
              Salvar alterações
            </button>

            {app.status === "rejeitado" && (
              <div className="border-t border-hairline pt-5 mt-1">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-destructive mb-2">
                  Zona de risco
                </p>
                <p className="text-sm text-ink-soft mb-4 leading-relaxed">
                  Esta candidatura foi rejeitada. Você pode excluí-la
                  permanentemente do sistema. Esta ação não pode ser desfeita.
                </p>
                <button
                  onClick={async () => {
                    const ok = window.confirm(
                      `Excluir definitivamente a candidatura de ${app.full_name}? Esta ação não pode ser desfeita.`,
                    );
                    if (!ok) return;
                    await onDelete(app.id);
                  }}
                  className="w-full sm:w-auto sm:self-start border border-destructive text-destructive px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Excluir candidatura
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold-deep mb-3">
      {title}
    </h3>
    <div className="grid gap-2">{children}</div>
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 text-sm">
    <span className="text-ink-soft text-xs sm:text-sm uppercase sm:normal-case tracking-wider sm:tracking-normal">{k}</span>
    <span className="text-ink break-anywhere">{v}</span>
  </div>
);

export default Admin;