import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

interface Payload {
  full_name: string;
  company: string;
  whatsapp: string;
  email: string;
  experience: string;
  hours_per_week: string;
  prior_participation: boolean;
  prior_participation_details?: string | null;
  motivation?: string | null;
  committee_ids: string[];
}

const VALID_HOURS = ["1-2", "2-3", "3+"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  // Basic validation
  const errors: string[] = [];
  if (!body.full_name || body.full_name.trim().length < 3) errors.push("Nome completo inválido");
  if (!body.company || body.company.trim().length < 2) errors.push("Empresa inválida");
  if (!body.whatsapp || body.whatsapp.trim().length < 10) errors.push("WhatsApp inválido");
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) errors.push("E-mail inválido");
  if (!body.experience || body.experience.trim().length < 20) errors.push("Experiência muito curta");
  if (!VALID_HOURS.includes(body.hours_per_week)) errors.push("Disponibilidade inválida");
  if (typeof body.prior_participation !== "boolean") errors.push("Participação anterior inválida");
  if (!Array.isArray(body.committee_ids) || body.committee_ids.length === 0) {
    errors.push("Selecione ao menos um comitê");
  }
  if (errors.length) return json({ error: errors.join("; ") }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: app, error } = await supabase
    .from("applications")
    .insert({
      full_name: body.full_name.trim().slice(0, 120),
      company: body.company.trim().slice(0, 160),
      whatsapp: body.whatsapp.trim().slice(0, 25),
      email: body.email.trim().slice(0, 180),
      experience: body.experience.trim().slice(0, 2000),
      hours_per_week: body.hours_per_week,
      prior_participation: body.prior_participation,
      prior_participation_details: body.prior_participation
        ? (body.prior_participation_details ?? "").toString().slice(0, 300) || null
        : null,
      motivation: body.motivation ? body.motivation.toString().slice(0, 2000) : null,
    })
    .select("id")
    .single();

  if (error || !app) {
    return json({ error: error?.message ?? "Falha ao registrar candidatura" }, 500);
  }

  const links = body.committee_ids.map((cid) => ({
    application_id: app.id,
    committee_id: cid,
  }));

  const { error: linkErr } = await supabase
    .from("application_committees")
    .insert(links);

  if (linkErr) {
    return json({ error: linkErr.message }, 500);
  }

  return json({ ok: true, id: app.id }, 200);
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}