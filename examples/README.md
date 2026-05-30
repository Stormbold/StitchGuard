# Examples Gallery

Pre-generated StitchGuard runs — open any folder to see the full output without running the CLI.

| Example | Story |
|---------|-------|
| [google-stitch-to-codex](google-stitch-to-codex/) | Google Stitch design vs Codex implementation |
| [shadcn-dashboard](shadcn-dashboard/) | Card radius / button width mismatch |
| [landing-page](landing-page/) | Hero spacing drift |
| [broken-tailwind-card](broken-tailwind-card/) | Padding and CTA width |

Each folder contains:

- `target.png` / `actual.png`
- `diff.png` / `heatmap.png`
- `report.md` / `codex-fix-prompt.md` / `result.json`

Regenerate all examples:

```bash
pnpm build
pnpm generate-examples
```

Dev servers for live `check`:

- `node examples/nextjs-basic/server.mjs` → http://localhost:3000
- `node examples/vite-react/server.mjs` → http://localhost:5173
