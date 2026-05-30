# StitchGuard

AI frontend agents are fast.  
But they often ignore the design.

StitchGuard compares your target design screenshot with your actual app screenshot and generates a precise repair report for Codex, Cursor, Claude Code, and other AI coding agents.

> **Disclaimer:** StitchGuard is not affiliated with Google, OpenAI, Anthropic, Cursor, or any design-to-code platform.

## Why?

Visual regression tools can tell you that pixels changed.

**StitchGuard tells your coding agent what to fix.**

Existing tools show what changed. StitchGuard explains what to fix.

## Demo

```bash
npx stitchguard compare design.png actual.png
```

Output:

```
StitchGuard Report

Target: design.png
Actual: actual.png
Viewport: 390x844

Visual Match: 82.4%
Changed Pixels: 13.8%
Risk Level: Medium

Generated:
✓ .stitchguard/diff.png
✓ .stitchguard/heatmap.png
✓ .stitchguard/report.md
✓ .stitchguard/codex-fix-prompt.md
✓ .stitchguard/result.json
```

Try it locally with the included example screenshots:

```bash
pnpm install
pnpm generate-screenshots
pnpm build
pnpm exec stitchguard compare examples/screenshots/target.png examples/screenshots/actual.png
```

## Install

```bash
pnpm add -D @stitchguard/cli
# or
npx @stitchguard/cli compare design.png actual.png
```

## Usage

### Compare two screenshots

```bash
stitchguard compare ./design.png ./actual.png
stitchguard compare ./design.png ./actual.png --threshold 0.92 --agent codex
```

### Capture and compare a local web app

```bash
stitchguard check \
  --target ./design/home-mobile.png \
  --url http://localhost:3000 \
  --viewport 390x844 \
  --wait 1000
```

### Agent repair loop

```bash
stitchguard check --target design.png --url http://localhost:3000 --agent codex
# Copy .stitchguard/codex-fix-prompt.md into Codex/Cursor/Claude Code
```

### Generate agent prompt from existing report

```bash
stitchguard agent-prompt --agent cursor --report .stitchguard/result.json
```

### Initialize config

```bash
stitchguard init
```

## Generated artifacts

| File | Description |
|------|-------------|
| `diff.png` | Pixel difference visualization |
| `heatmap.png` | Regional mismatch heatmap |
| `report.md` | Human-readable findings report |
| `result.json` | Machine-readable compare result |
| `codex-fix-prompt.md` | Conservative repair prompt for AI agents |

## GitHub Actions

```yaml
- uses: stitchguard/stitchguard-action@v1
  with:
    target: ./design/home.png
    url: http://localhost:3000
    threshold: 0.90
```

See [docs/github-actions.md](docs/github-actions.md) for details.

## Documentation

- [Quickstart](docs/quickstart.md)
- [Concepts](docs/concepts.md)
- [Thresholds](docs/thresholds.md)
- [Codex workflow](docs/codex-workflow.md)
- [Cursor workflow](docs/cursor-workflow.md)
- [Claude Code workflow](docs/claude-code-workflow.md)
- [Google Stitch workflow](docs/google-stitch-workflow.md)
- [Ignore regions](docs/ignore-regions.md)
- [Roadmap](docs/roadmap.md)

## License

MIT — see [LICENSE](LICENSE).
