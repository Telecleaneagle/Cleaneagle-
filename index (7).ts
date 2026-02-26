import { Hono } from "hono";
import { makeId } from "@anchorq/schema";
import { log, makeTraceHeaders } from "@anchorq/telemetry";

type Env = { ANCHORQ_ENV: string; KERNEL_URL: string };
const app = new Hono<{ Bindings: Env }>();

const requestId = () => makeId("req_");
const traceId = () => makeId("trc_", 16);

const routes = new Map<string, { primary: string }>([["payments", { primary: "https://example.com" }]]);

app.get("/health", (c) => {
  const rid = requestId();
  const tid = traceId();
  return c.json({ ok: true, service: "edge-proxy", env: c.env.ANCHORQ_ENV ?? "dev", requestId: rid, traceId: tid }, 200, makeTraceHeaders(rid, tid));
});

app.all("/:tenantId/:workspaceId/:dependency/*", async (c) => {
  const rid = requestId();
  const tid = traceId();
  const { tenantId, workspaceId, dependency } = c.req.param();
  const r = routes.get(dependency);
  if (!r) return c.json({ ok: false, error: "unknown_dependency", dependency }, 404, makeTraceHeaders(rid, tid));

  const tail = c.req.path.split(`/${tenantId}/${workspaceId}/${dependency}`)[1] || "/";
  const url = new URL(r.primary);
  url.pathname = (url.pathname.replace(/\/$/, "") + tail).replace(/\/\//g, "/");
  url.search = new URL(c.req.url).search;

  const started = Date.now();
  try {
    const res = await fetch(url.toString(), { method: c.req.method, headers: c.req.raw.headers, body: ["GET","HEAD"].includes(c.req.method) ? undefined : await c.req.arrayBuffer() });
    log("info", "shield_proxy", { requestId: rid, tenantId, workspaceId, dependency, status: res.status, latencyMs: Date.now() - started });

    const headers = new Headers(res.headers);
    headers.set("x-anchorq-request-id", rid);
    headers.set("x-anchorq-trace-id", tid);
    headers.set("x-anchorq-dependency", dependency);
    return new Response(res.body, { status: res.status, headers });
  } catch (e: any) {
    log("error", "shield_proxy_error", { requestId: rid, tenantId, workspaceId, dependency, error: String(e?.message ?? e) });
    return c.json({ ok: false, error: "upstream_failed", dependency }, 502, makeTraceHeaders(rid, tid));
  }
});

export default app;
