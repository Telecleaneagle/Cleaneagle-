import { PolicyCheckInput, PolicyCheckOutput, UsageEvent } from "@anchorq/schema";

export type AnchorqClientOptions = { kernelUrl: string; apiKey?: string };

export class AnchorqClient {
  constructor(private opts: AnchorqClientOptions) {}
  private headers() {
    return {
      "content-type":"application/json",
      ...(this.opts.apiKey ? { authorization: `Bearer ${this.opts.apiKey}` } : {}),
    };
  }
  async devInfo() {
    const res = await fetch(`${this.opts.kernelUrl}/v1/dev`);
    if (!res.ok) throw new Error(`devInfo failed: ${res.status}`);
    return res.json();
  }
  async policyCheck(input: PolicyCheckInput): Promise<PolicyCheckOutput> {
    const res = await fetch(`${this.opts.kernelUrl}/v1/policy/check`, { method:"POST", headers:this.headers(), body:JSON.stringify(input) });
    if (!res.ok) throw new Error(`policyCheck failed: ${res.status}`);
    return PolicyCheckOutput.parse(await res.json());
  }
  async usageIngest(evt: UsageEvent) {
    const res = await fetch(`${this.opts.kernelUrl}/v1/usage/ingest`, { method:"POST", headers:this.headers(), body:JSON.stringify(evt) });
    if (!res.ok) throw new Error(`usageIngest failed: ${res.status}`);
    return res.json();
  }
}
