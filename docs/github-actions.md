# GitHub Actions

## Compare mode

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
      - run: pnpm build
      - uses: ./.github/actions/stitchguard
        with:
          target: ./design/home.png
          actual: ./screenshots/actual.png
          threshold: '0.90'
```

## Check mode (Playwright capture)

```yaml
      - run: npm ci
      - run: npm run dev &
      - run: pnpm exec playwright install chromium
      - uses: ./.github/actions/stitchguard
        with:
          target: ./design/home.png
          url: http://localhost:3000
          viewport: 390x844
          threshold: '0.90'
```

## PR comments

Set `comment-on-pr: 'true'` to post a summary comment on pull requests. Requires `pull-requests: write` permission and `GITHUB_TOKEN`.

## Artifacts

Upload `.stitchguard/` as a workflow artifact to share diff images and repair prompts with reviewers.
