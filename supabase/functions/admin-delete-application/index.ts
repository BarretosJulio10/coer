import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireAdmin } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = requireAdmin(req);
  if (auth) return auth;

  const body = await req.json().catch(() => null) as { id?: string } | null;

  if (!body || typeof body.id !== "string") {
    return new Response(
      JSON.stringify({ error: "ID inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Garante que só candidaturas rejeitadas podem ser excluídas.
  const { data: existing, error: fetchErr } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", body.id)
    .maybeSingle();

  if (fetchErr) {
    return new Response(
      JSON.stringify({ error: fetchErr.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (!existing) {
    return new Response(
      JSON.stringify({ error: "Candidatura não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (existing.status !== "rejeitado") {
    return new Response(
      JSON.stringify({ error: "Apenas candidaturas rejeitadas podem ser excluídas." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Remove vínculos com comitês primeiro (caso não exista cascade).
  await supabase.from("application_committees").delete().eq("application_id", body.id);

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", body.id);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});