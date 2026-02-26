import { z } from "zod";

export const ModuleIdSchema = z.enum(["shield","contracts","dna"]);
export type ModuleId = z.infer<typeof ModuleIdSchema>;

export const CapabilitySchema = z.enum(["read","write","deploy","export","admin"]);
export type ModuleCapability = z.infer<typeof CapabilitySchema>;

export const IdPrefix = {
  tenant:"tnt_", workspace:"wsp_", project:"prj_", event:"evt_", apiKey:"key_", policy:"pol_",
  route:"rte_", build:"bld_", brand:"brd_", request:"req_", trace:"trc_",
} as const;

export function makeId(prefix: string, entropy = 10) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i=0;i<entropy;i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return `${prefix}${s}`;
}

export const PolicyCheckInput = z.object({
  tenantId: z.string(),
  workspaceId: z.string(),
  role: z.string().optional(),
  action: z.string(),
  resource: z.string().optional(),
});
export type PolicyCheckInput = z.infer<typeof PolicyCheckInput>;

export const PolicyCheckOutput = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
});
export type PolicyCheckOutput = z.infer<typeof PolicyCheckOutput>;

export const UsageEvent = z.object({
  tenantId: z.string(),
  workspaceId: z.string(),
  module: ModuleIdSchema,
  unit: z.string(),
  qty: z.number().int().nonnegative(),
  at: z.string(),
  meta: z.record(z.any()).optional(),
});
export type UsageEvent = z.infer<typeof UsageEvent>;
