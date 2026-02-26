import { Hono } from "hono";
import { makeId, PolicyCheckInput, UsageEvent } from "@anchorq/schema";
import { isAllowed, type RoleMap } from "@anchorq/policy";
import { log, makeTraceHeaders } from "@anchorq/telemetry";
import policyJson from "../../../tenants/default/policy.json";
import featuresJson from "../../../tenants/default/features.json";
import plansJson from "../../../tenants/default/plans.json";

type Env = { ANCHORQ_ENV: string };
const app = new Hono<{ Bindings: Env }>();

const roleMap = (policyJson as any).roles as RoleMap;
const apiKeys = new Map<string, { apiKey: string; tenantId: string; role: string; planId: string; workspaceId: string }>();
apiKeys.set("key_dev_anchorq_ultra", { apiKey: "key_dev_anchorq_ultra", tenantId: "tnt_default", role: "owner", planId: "pro", workspaceId: "wsp_prod" });

const requestId = () => makeId("req_");
const traceId = () => makeId("trc_", 16);

function auth(c: any) {
  const authz = c.req.header("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  return apiKeys.get(token) ?? null;
}

app.get("/health", (c) => {
  const rid = requestId();
  const tid = traceId();
  return c.json({ ok: true, service: "kernel-api", env: c.env.ANCHORQ_ENV ?? "dev", requestId: rid, traceId: tid }, 200, makeTraceHeaders(rid, tid));
});

app.get("/v1/config", (c) => {
  const rid = requestId();
  const tid = traceId();
  return c.json({ features: featuresJson, plans: plansJson }, 200, makeTraceHeaders(rid, tid));
});

app.post("/v1/policy/check", async (c) => {
  const rid = requestId();
  const tid = traceId();
  const principal = auth(c);
  if (!principal) return c.json({ allowed: false, reason: "unauthorized" }, 401, makeTraceHeaders(rid, tid));

  const input = PolicyCheckInput.parse(await c.req.json());
  const allowed = isAllowed(roleMap, principal.role as any, input.action as any);
  log("info", "policy_check", { requestId: rid, tenantId: principal.tenantId, role: principal.role, action: input.action, allowed });
  return c.json({ allowed, ...(allowed ? {} : { reason: "denied" }) }, 200, makeTraceHeaders(rid, tid));
});

app.post("/v1/usage/ingest", async (c) => {
  const rid = requestId();
  const tid = traceId();
  const principal = auth(c);
  if (!principal) return c.json({ ok: false, error: "unauthorized" }, 401, makeTraceHeaders(rid, tid));
  const evt = UsageEvent.parse(await c.req.json());
  return c.json({ ok: true, accepted: evt }, 200, makeTraceHeaders(rid, tid));
});

app.get("/v1/dev", (c) => {
  const rid = requestId();
  const tid = traceId();
  return c.json({ devApiKey: "key_dev_anchorq_ultra", tenantId: "tnt_default", workspaceId: "wsp_prod", role: "owner", planId: "pro" }, 200, makeTraceHeaders(rid, tid));
});

export default app;
