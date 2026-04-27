import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireAdmin } from "../_shared/cors.ts";

const VALID_STATUS = ["pendente", "em_analise", "aprovado", "rejeitado"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = requireAdmin(req);
  if (auth) return auth;

  const body = await req.json().catch(() => null) as
    | { id?: string; status?: string; internal_notes?: string }
    | null;

  if (!body || typeof body.id !== "string") {
    return new Response(
      JSON.stringify({ error: "ID inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!VALID_STATUS.includes(body.status)) {
      return new Response(
        JSON.stringify({ error: "Status inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    updates.status = body.status;
  }
  if (typeof body.internal_notes === "string") {
    updates.internal_notes = body.internal_notes.slice(0, 5000);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase
    .from("applications")
    .update(updates)
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