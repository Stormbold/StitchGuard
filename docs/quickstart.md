# Quickstart

## Install

```bash
pnpm add -D @stitchguard/cli
```

Or run without installing:

```bash
npx @stitchguard/cli compare design.png actual.png
```

## Compare two screenshots

```bash
stitchguard compare ./design.png ./actual.png
```

Artifacts are written to `.stitchguard/` by default.

## Compare against a running app

First-time setup for URL capture:

```bash
pnpm setup:browser
```

Start your dev server, then:

```bash
stitchguard check \
  --target ./design/mobile.png \
  --url http://localhost:3000 \
  --viewport 390x844
```

## Use the repair prompt

1. Open `.stitchguard/codex-fix-prompt.md`
2. Paste into Codex, Cursor, or Claude Code
3. Let the agent make a conservative visual fix pass
4. Re-run StitchGuard to measure improvement

## Configure defaults

```bash
stitchguard init
```

Edit `stitchguard.config.ts` to set viewport, threshold, and ignore regions.
