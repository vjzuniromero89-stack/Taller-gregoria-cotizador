/**
 * Cloudflare Worker entry point.
 * Serves the Vite SPA and exposes safe public runtime configuration.
 * Configure SUPABASE_URL and SUPABASE_ANON_KEY in Cloudflare Runtime Variables/Secrets.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/runtime-config.js") {
      const config = {
        SUPABASE_URL: env.SUPABASE_URL || "",
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || "",
      };
      return new Response(`globalThis.__APP_CONFIG__ = ${JSON.stringify(config)};`, {
        headers: {
          "content-type": "application/javascript; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
      });
    }

    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "taller-gregoria-cotizador",
        supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
      }, { headers: { "cache-control": "no-store" } });
    }

    return env.ASSETS.fetch(request);
  },
};
