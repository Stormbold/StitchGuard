# Roadmap

## Phase 1 — Demo & positioning ✅

- [why-stitchguard.md](why-stitchguard.md) — positioning vs pixel diff tools
- [examples/](../examples/) gallery with pre-generated artifacts
- README before/after story

## Phase 2 — GitHub Action v1 ✅

- Root `action/` with ncc bundle — `uses: Stormbold/StitchGuard/action@v1`
- Rich PR comments via `generatePrComment()`
- Artifact upload + extended inputs
- [release-action.yml](../.github/workflows/release-action.yml)

## Phase 3 — MCP Server ✅

- `packages/mcp-server` — 5 tools for agent loops
- [mcp-setup.md](mcp-setup.md)

## Phase 4 — Examples Gallery + Bad UI Zoo ✅

- [examples/README.md](../examples/README.md) index
- `bad-ui-zoo/` Vitest regression fixtures

## Phase 5 — Tailwind hints v2 + init-agent ✅

- Inspect-oriented Tailwind hints (no exact DOM claims)
- `stitchguard init-agent` → `.stitchguard/` agent rules

## Phase 6 — Web Demo ✅

- Client-side compare demo with embedded samples

## Later

- VS Code extension, Storybook addon
- Flutter capture, Figma plugin
- Separate `stitchguard-action` repo if traction warrants
