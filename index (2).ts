export type Role = "owner"|"admin"|"engineer"|"analyst"|"client";
export type Permission = `${string}:${string}`;
export type RoleMap = Record<Role, Permission[]>;

export function isAllowed(roleMap: RoleMap, role: Role | undefined, action: Permission) {
  if (!role) return false;
  const perms = roleMap[role] ?? [];
  if (perms.includes("admin:*")) return true;
  const [aDomain] = action.split(":");
  return perms.some((p) => {
    if (p === action) return true;
    const [pDomain, pVerb] = p.split(":");
    return pDomain === aDomain && pVerb === "*";
  });
}
