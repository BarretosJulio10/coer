export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

/**
 * Validates the admin token sent in the `x-admin-token` header against the
 * COER_ADMIN_PASSWORD secret. Returns null when the token is valid, or a
 * Response (401) when invalid.
 */
export function requireAdmin(req: Request): Response | null {
  const expected = Deno.env.get("COER_ADMIN_PASSWORD") ?? "";
  const token = req.headers.get("x-admin-token") ?? "";
  if (!expected || token !== expected) {
    return new Response(
      JSON.stringify({ error: "Não autorizado" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  return null;
}