# Why StitchGuard?

Visual regression tools tell you **when pixels changed**.

StitchGuard is different: it turns visual mismatch into **actionable repair instructions** for AI coding agents.

## The problem

AI coding agents (Codex, Cursor, Claude Code) can build frontends quickly, but often miss:

- spacing and alignment
- border radius
- typography scale
- color tokens
- safe-area / bottom navigation padding

You end up saying: *"No, make it more like the screenshot."* The agent changes something else. Repeat.

## What StitchGuard does

```
target.png + actual.png
        ↓
   stitchguard compare
        ↓
Visual Match: 82.4%
        ↓
report.md + codex-fix-prompt.md
        ↓
Agent applies conservative visual fixes
        ↓
Re-run → higher score
```

## How it differs from other tools

| | Visual regression (Playwright, Percy) | Pixel diff only (Pixelmatch) | StitchGuard |
|--|--------------------------------------|------------------------------|-------------|
| Screenshot compare | yes | yes | yes |
| Diff / heatmap | yes | yes | yes |
| CI gate | yes | manual | yes |
| Human-readable findings | limited | no | yes |
| Agent repair prompt | no | no | **yes** |
| Design-fidelity focus | medium | low | **high** |

**Playwright MCP** lets agents browse the app.  
**StitchGuard** tells agents whether the app matches the design — and what to fix.

StitchGuard does not replace Playwright. It complements it for design-to-implementation QA.

## What StitchGuard is not

- Not a Figma-to-code generator
- Not a pixel-perfect guarantee
- Not an automatic code patcher (MVP)

StitchGuard measures and explains visual differences honestly, then generates repair prompts.

## Who it's for

- Developers using AI agents for frontend work
- Teams comparing design screenshots against implementations
- Maintainers who want visual checks in PRs with agent-ready output

See [Getting started](getting-started.md) to try it in 2 minutes.
