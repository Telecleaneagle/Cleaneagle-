export type LogLevel="debug"|"info"|"warn"|"error";
export function log(level:LogLevel,msg:string,data?:Record<string,unknown>){console.log(JSON.stringify({ts:new Date().toISOString(),level,msg,...(data?{data}:{})}))}
export function makeTraceHeaders(requestId:string,traceId:string){return {"x-anchorq-request-id":requestId,"x-anchorq-trace-id":traceId}}
