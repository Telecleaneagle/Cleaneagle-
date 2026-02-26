import { Hono } from "hono";
import { makeId } from "@anchorq/schema";
import { makeTraceHeaders } from "@anchorq/telemetry";
const app=new Hono();
const requestId=()=>makeId("req_");
const traceId=()=>makeId("trc_",16);
app.get('/health',(c)=>{const rid=requestId();const tid=traceId();return c.json({ok:true,service:"dna-engine",requestId:rid,traceId:tid},200,makeTraceHeaders(rid,tid));});
export default app;
