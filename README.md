# StitchGuard

AI frontend agents are fast.  
But they often ignore the design.

StitchGuard compares your target design screenshot with your implemented UI and generates a precise repair report for Codex, Cursor, Claude Code, and other AI coding agents.

> **Disclaimer:** StitchGuard is not affiliated with Google, OpenAI, Anthropic, Cursor, or any design-to-code platform.

## Why?

Visual regression tools tell you that pixels changed.  
**StitchGuard tells your coding agent what to fix.**

---

## Getting started

### Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

### 1. Clone and install

```bash
git clone https://github.com/Stormbold/StitchGuard.git
cd StitchGuard
pnpm install
pnpm build
```

### 2. One-time browser setup (for `check --url`)

If you want to capture a running dev server (not just compare PNG files):

```bash
pnpm setup:browser
```

This downloads Chromium for Playwright (~180 MB).

### 3. Try the demo

```bash
pnpm generate-screenshots
pnpm stitchguard compare examples/screenshots/target.png examples/screenshots/actual.png
```

Open `.stitchguard/report.md` and `.stitchguard/codex-fix-prompt.md`.

---

## User guide

### Workflow A — Compare two screenshots

Use this when you already have a design PNG and an implementation PNG.

```bash
pnpm stitchguard compare ./design.png ./actual.png
```

**Options:**

| Flag | Description |
|------|-------------|
| `--threshold 0.92` | Fail (exit 1) if match is below 92% |
| `--agent codex` | Also write prompts for codex, cursor, claude |
| `-o .stitchguard` | Custom output directory |

**Output** (in `.stitchguard/`):

| File | Purpose |
|------|---------|
| `diff.png` | Pixel diff image |
| `heatmap.png` | Where differences cluster |
| `report.md` | Human-readable findings |
| `result.json` | Machine-readable data |
| `codex-fix-prompt.md` | Paste into your coding agent |

### Workflow B — Compare against a running app

Use this during development when your app runs on localhost.

**Terminal 1** — start your app:

```bash
npm run dev
```

**Terminal 2** — capture and compare:

```bash
pnpm stitchguard check \
  --target ./design/mobile-home.png \
  --url http://localhost:3000 \
  --viewport 390x844 \
  --wait 1000
```

Try with the included example server:

```bash
node examples/nextjs-basic/server.mjs
# in another terminal:
pnpm stitchguard check \
  --target examples/screenshots/target.png \
  --url http://localhost:3000 \
  --viewport 390x844
```

### Workflow C — Agent repair loop

1. Run StitchGuard (compare or check)
2. Open `.stitchguard/codex-fix-prompt.md` (or cursor/claude variant)
3. Paste the prompt into Codex, Cursor, or Claude Code
4. Let the agent apply a **conservative visual fix** (spacing, colors, radius — no rewrite)
5. Re-run StitchGuard and check if the score improved

```bash
pnpm stitchguard check \
  --target ./design.png \
  --url http://localhost:3000 \
  --agent codex
```

With `--agent`, all three prompt files are written to `.stitchguard/prompts/`.

### Workflow D — Config file

```bash
pnpm stitchguard init
```

Creates `stitchguard.config.ts` with defaults (viewport, threshold, ignore regions).  
Edit it once, then every command picks up your settings.

### Regenerate a prompt from an existing report

```bash
pnpm stitchguard agent-prompt --agent cursor --report .stitchguard/result.json
```

---

## Understanding the score

| Visual Match | Meaning |
|--------------|---------|
| 90–100% | Very close to target |
| 85–89% | Acceptable, minor fixes |
| 70–84% | Visible differences — repair recommended |
| Below 70% | Major layout mismatch |

Default CI threshold: **0.85** (85%).

---

## GitHub Actions

Use the bundled action from this repo:

```yaml
name: Visual Design Guard

on:
  pull_request:

jobs:
  stitchguard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install
      - run: pnpm exec playwright install chromium --with-deps
      - run: pnpm build

      # Compare two committed screenshots:
      - uses: ./.github/actions/stitchguard
        with:
          target: examples/screenshots/target.png
          actual: path/to/your-screenshot.png
          threshold: "0.85"

      # Or capture a running app:
      # - run: npm run dev &
      # - uses: ./.github/actions/stitchguard
      #   with:
      #     target: design/home.png
      #     url: http://localhost:3000
      #     viewport: 390x844
      #     threshold: "0.90"
```

See [docs/github-actions.md](docs/github-actions.md) for PR comments and artifacts.

---

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

---

## Documentation

- [Getting started](docs/getting-started.md)
- [Quickstart](docs/quickstart.md)
- [Concepts](docs/concepts.md)
- [Thresholds](docs/thresholds.md)
- [Codex workflow](docs/codex-workflow.md)
- [Cursor workflow](docs/cursor-workflow.md)
- [Claude Code workflow](docs/claude-code-workflow.md)
- [Ignore regions](docs/ignore-regions.md)
- [Roadmap](docs/roadmap.md)

## License

MIT — see [LICENSE](LICENSE).
