# ANCHORQ — Ultra Elite Deployable (V2)

**Unzip → install → run.** Monorepo with:
- Studio (Next.js 14) :3000
- Portal (Next.js 14) :3001
- Kernel API Worker (Hono) :8787
- Edge Proxy Worker (Hono) :8788
- Contracts Engine Worker :8789
- DNA Engine Worker :8790

## Requirements
- Node.js 20+
- pnpm 9+

## Quickstart
```bash
pnpm install
pnpm dev
```

Open:
- Studio: http://localhost:3000
- Portal: http://localhost:3001
- Kernel: http://localhost:8787/health
- Edge: http://localhost:8788/health

## Local dev API key (scaffold)
```bash
curl http://localhost:8787/v1/dev
```
