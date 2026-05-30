# GitHub Actions

## External usage (recommended)

Use the published action from this repo — no monorepo build required:

```yaml
name: Visual Design Guard

on:
  pull_request:

jobs:
  stitchguard:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      actions: write
    steps:
      - uses: actions/checkout@v4

      - uses: Stormbold/StitchGuard/action@v1
        with:
          target: ./design/home.png
          actual: ./screenshots/actual.png
          threshold: '0.90'
          comment-on-pr: 'true'
          upload-artifacts: 'true'
```

## Check mode (Playwright capture)

When `url` is set, StitchGuard installs Chromium automatically (unless `install-playwright: 'false'`).

```yaml
      - run: npm ci
      - run: npm run dev &

      - uses: Stormbold/StitchGuard/action@v1
        with:
          target: ./design/home.png
          url: http://localhost:3000
          viewport: 390x844
          threshold: '0.90'
```

## Inputs

| Input | Default | Purpose |
|-------|---------|---------|
| `target` | — | Target design screenshot (required) |
| `actual` | — | Actual screenshot (compare mode) |
| `url` | — | URL to capture (check mode) |
| `threshold` | `0.85` | Pass threshold (0–1) |
| `comment-on-pr` | `true` | Post PR summary comment |
| `upload-artifacts` | `true` | Upload diff, heatmap, report, prompt |
| `fail-on-threshold` | `true` | Fail job when below threshold |
| `attach-prompt` | `false` | Collapsible prompt in PR comment |
| `install-playwright` | `true` | Auto-install Chromium when `url` is set |

## Outputs

| Output | Description |
|--------|-------------|
| `score` | Visual match (0–1) |
| `passed` | Whether threshold was met |
| `report-path` | Path to `report.md` |
| `artifact-url` | Link to workflow run |

## Monorepo dogfooding

This repo uses `./action` directly in [visual-check.yml](../.github/workflows/visual-check.yml).

Build locally:

```bash
pnpm build:action
```

## PR comments

Set `comment-on-pr: 'true'` to post a summary with findings and artifact links. Requires `pull-requests: write` and `actions: write` permissions.
