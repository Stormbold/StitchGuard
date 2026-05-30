# Getting Started

Step-by-step guide for first-time StitchGuard users.

## Install

```bash
git clone https://github.com/Stormbold/StitchGuard.git
cd StitchGuard
pnpm install
pnpm build
```

## Browser setup (only for live URL capture)

Skip this if you only compare PNG files.

```bash
pnpm setup:browser
```

## First compare

```bash
pnpm generate-screenshots
pnpm stitchguard compare examples/screenshots/target.png examples/screenshots/actual.png
```

Check the output in `.stitchguard/`:

1. **`report.md`** — what differs and where
2. **`codex-fix-prompt.md`** — ready-to-paste repair instructions
3. **`diff.png`** — visual diff

## Compare your own design

1. Export your target design as PNG (e.g. 390×844 for mobile)
2. Take a screenshot of your implementation (same dimensions if possible)
3. Run:

```bash
pnpm stitchguard compare ./my-design.png ./my-app.png
```

## Compare a live dev server

1. Start your app: `npm run dev`
2. Run:

```bash
pnpm stitchguard check \
  --target ./my-design.png \
  --url http://localhost:3000 \
  --viewport 390x844 \
  --wait 1000
```

## Fix loop with a coding agent

1. Run compare or check
2. Copy `.stitchguard/codex-fix-prompt.md` into Codex, Cursor, or Claude Code
3. Review the agent's visual-only changes
4. Re-run StitchGuard — aim for a higher Visual Match score

## Optional: config file

```bash
pnpm stitchguard init
```

Edit `stitchguard.config.ts` to set default viewport, threshold, and regions to ignore.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `check` fails with browser error | Run `pnpm setup:browser` |
| Score too low for minor differences | Use `ignoreRegions` in config for dynamic content (clock, avatars) |
| Command not found | Run `pnpm build` first, then use `pnpm stitchguard …` |
| Exit code 1 in CI | Lower is worse — raise threshold or fix visual differences |
