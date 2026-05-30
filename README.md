# StitchGuard

AI frontend agents are fast.  
But they often ignore the design.

StitchGuard compares your target design screenshot with your implemented UI and generates a precise repair report for Codex, Cursor, Claude Code, and other AI coding agents.

**Live demo:** [stormbold.github.io/StitchGuard](https://stormbold.github.io/StitchGuard/) — try the sample in your browser, no install.

> **Disclaimer:** StitchGuard is not affiliated with Google, OpenAI, Anthropic, Cursor, or any design-to-code platform.

## Why StitchGuard?

Visual regression tools tell you that pixels changed.  
**StitchGuard tells your coding agent what to fix.**

Read [docs/why-stitchguard.md](docs/why-stitchguard.md) for the full positioning vs Playwright / Pixelmatch.

### Flagship example: Google Stitch → Codex

| Target design | Codex implementation |
|---------------|---------------------|
| ![Target](examples/google-stitch-to-codex/target.png) | ![Actual](examples/google-stitch-to-codex/actual.png) |

Pre-generated report: [examples/google-stitch-to-codex/report.md](examples/google-stitch-to-codex/report.md)  
Repair prompt: [examples/google-stitch-to-codex/codex-fix-prompt.md](examples/google-stitch-to-codex/codex-fix-prompt.md)

**3-step story:** Compare → Report → Prompt → Agent fix

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
pnpm generate-examples
```

### 2. One-time browser setup (for `check --url`)

```bash
pnpm setup:browser
```

### 3. Try the demo

```bash
pnpm stitchguard compare examples/screenshots/target.png examples/screenshots/actual.png
```

Open `.stitchguard/report.md` and `.stitchguard/codex-fix-prompt.md`.

### 4. Web demo (browser-only)

**Online:** [https://stormbold.github.io/StitchGuard/](https://stormbold.github.io/StitchGuard/)

**Local:**
```bash
pnpm demo:web
```

Click **Try sample** — no server upload, runs client-side.

---

## User guide

### Compare two screenshots

```bash
pnpm stitchguard compare ./design.png ./actual.png
```

| Flag | Description |
|------|-------------|
| `--threshold 0.92` | Fail if match is below 92% |
| `--agent codex` | Write codex/cursor/claude prompts |
| `--tailwind` | Include inspect-oriented Tailwind hints |
| `-o .stitchguard` | Custom output directory |

### Check a running app

```bash
pnpm stitchguard check \
  --target ./design/mobile-home.png \
  --url http://localhost:3000 \
  --viewport 390x844
```

### Agent repair loop

1. Run StitchGuard (compare or check)
2. Open `.stitchguard/codex-fix-prompt.md`
3. Paste into your coding agent
4. Re-run until the score improves

### Init agent rules in your project

```bash
pnpm stitchguard init-agent
```

Creates `.stitchguard/agent-rules.md` and prompt templates (opt-in `--write-agents-md` for root `AGENTS.md`).

---

## GitHub Actions

External repos — no monorepo build:

```yaml
- uses: Stormbold/StitchGuard/action@v1
  with:
    target: ./design/home.png
    actual: ./screenshots/actual.png
    threshold: "0.90"
    comment-on-pr: "true"
    upload-artifacts: "true"
```

See [docs/github-actions.md](docs/github-actions.md).

---

## MCP Server

Agents can capture, compare, and generate prompts in a loop:

```bash
node packages/mcp-server/dist/index.js
```

See [docs/mcp-setup.md](docs/mcp-setup.md).

---

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm build:action
pnpm generate-all
```

---

## Documentation

- [Why StitchGuard?](docs/why-stitchguard.md)
- [Getting started](docs/getting-started.md)
- [Examples gallery](examples/README.md)
- [GitHub Actions](docs/github-actions.md)
- [MCP setup](docs/mcp-setup.md)
- [Roadmap](docs/roadmap.md)
- [Good first issues](docs/good-first-issues.md)

## License

MIT — see [LICENSE](LICENSE).
