import { z } from "zod";
const EnvSchema=z.object({ANCHORQ_ENV:z.string().default("dev"),KERNEL_URL:z.string().optional()});
export type AnchorqEnv=z.infer<typeof EnvSchema>;
export function getEnv(raw:Record<string,unknown>){return EnvSchema.parse(raw)}
