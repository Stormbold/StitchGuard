# AGENTS.md

This repository contains StitchGuard, a TypeScript monorepo for visual comparison and AI frontend repair reports.

## Rules for AI coding agents

- Do not introduce large dependencies without justification.
- Keep packages small and focused.
- Prefer pure functions in `pkg/core`.
- Do not put Playwright logic into `pkg/core`.
- Do not change public CLI behavior without updating docs.
- Add tests for scoring, region analysis, and report generation.
- Keep generated reports stable and deterministic.
- Avoid claims of pixel-perfect guarantees.

## Common commands

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm generate-screenshots
pnpm exec stitchguard compare examples/screenshots/target.png examples/screenshots/actual.png
```

## Architecture

- `pkg/core`: image comparison and scoring
- `pkg/cli`: command-line interface
- `pkg/capture`: screenshot capture via Playwright
- `pkg/report`: markdown/json reports
- `pkg/agent-prompts`: Codex/Cursor/Claude prompt generation
- `pkg/config`: configuration loading
- `pkg/action`: GitHub Action runner
