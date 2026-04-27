import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json().catch(() => ({ password: "" }));
    const expected = Deno.env.get("COER_ADMIN_PASSWORD") ?? "";

    if (!expected) {
      return new Response(
        JSON.stringify({ error: "Senha admin não configurada no servidor." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (typeof password !== "string" || password !== expected) {
      return new Response(
        JSON.stringify({ error: "Senha incorreta." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Success — devolve o próprio segredo como token de sessão (armazenado
    // apenas em sessionStorage do admin). Simples e suficiente para uso interno.
    return new Response(
      JSON.stringify({ token: expected }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});