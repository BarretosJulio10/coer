import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireAdmin } from "../_shared/cors.ts";

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
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: links } = await supabase
    .from("application_committees")
    .select("application_id, committees(code, name)");

  const byApp = new Map<string, Array<{ code: string; name: string }>>();
  (links ?? []).forEach((row: any) => {
    const arr = byApp.get(row.application_id) ?? [];
    if (row.committees) arr.push(row.committees);
    byApp.set(row.application_id, arr);
  });

  const enriched = (applications ?? []).map((a: any) => ({
    ...a,
    committees: byApp.get(a.id) ?? [],
  }));

  return new Response(
    JSON.stringify({ applications: enriched }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});