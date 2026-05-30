# Concepts

StitchGuard has four layers:

1. **Capture** — screenshot from file or Playwright URL capture
2. **Compare** — pixel diff, regional analysis, color analysis
3. **Explain** — human-readable findings in `report.md`
4. **Repair Prompt** — agent-ready fix instructions

## Visual Match Score

| Score | Meaning |
|-------|---------|
| 90–100% | Very close to target |
| 85–89% | Acceptable with visible differences |
| 70–84% | Needs visual repair work |
| Below 70% | Likely wrong screen or major layout mismatch |

## Regional analysis

Screenshots are divided into vertical zones:

- header
- upper-content
- middle-content
- lower-content
- bottom/navigation

Findings describe which zones differ most — without claiming exact DOM element mapping.

## What StitchGuard is not

- Not a Figma-to-code generator
- Not a pixel-perfect guarantee
- Not an automatic code patcher (MVP)

StitchGuard measures and explains visual differences, then generates repair prompts for AI coding agents.
