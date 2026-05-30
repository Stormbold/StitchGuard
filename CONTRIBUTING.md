# Contributing to StitchGuard

Thank you for your interest in contributing!

## Getting Started

```bash
pnpm install
pnpm generate-screenshots
pnpm build
pnpm test
```

> **Note:** For local development, use an NTFS drive (not exFAT/USB). Some Windows removable drives block nested `node_modules` symlinks required by pnpm.

Packages live under `pkg/` (not `packages/`).

## Development Workflow

1. Fork the repository and create a feature branch.
2. Make focused changes with tests where applicable.
3. Run `pnpm lint` and `pnpm test` before opening a PR.
4. Keep packages small and focused — pure functions belong in `@stitchguard/core`.

## Good First Issues

Look for issues labeled `good first issue` — examples include JPEG support, JSON schema validation, and additional example apps.

## Code Style

- TypeScript strict mode
- Prettier for formatting (`pnpm format`)
- ESLint for linting (`pnpm lint`)

## Pull Requests

- Describe the problem and solution clearly.
- Include before/after screenshots for visual changes.
- Do not change public CLI behavior without updating docs.
