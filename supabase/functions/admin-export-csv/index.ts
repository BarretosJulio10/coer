import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireAdmin } from "../_shared/cors.ts";

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/"/g, '""');
  return `"${s}"`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = requireAdmin(req);
  if (auth) return auth;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: links } = await supabase
    .from("application_committees")
    .select("application_id, committees(code, name)");

  const byApp = new Map<string, string[]>();
  (links ?? []).forEach((row: any) => {
    const arr = byApp.get(row.application_id) ?? [];
    if (row.committees) arr.push(`${row.committees.code} ${row.committees.name}`);
    byApp.set(row.application_id, arr);
  });

  const headers = [
    "Data", "Status", "Nome", "Empresa", "WhatsApp", "E-mail",
    "Comitês", "Horas/semana", "Já participou", "Detalhes participação anterior",
    "Experiência", "Motivação", "Notas internas",
  ];

  const rows = (applications ?? []).map((a: any) => [
    new Date(a.created_at).toLocaleString("pt-BR"),
    a.status,
    a.full_name,
    a.company,
    a.whatsapp,
    a.email,
    (byApp.get(a.id) ?? []).join(" | "),
    a.hours_per_week,
    a.prior_participation ? "Sim" : "Não",
    a.prior_participation_details ?? "",
    a.experience,
    a.motivation ?? "",
    a.internal_notes ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map(csvCell).join(";"))
    .join("\r\n");

  // BOM para Excel abrir UTF-8 corretamente
  const body = "\uFEFF" + csv;

  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="coer-candidaturas.csv"`,
    },
  });
});