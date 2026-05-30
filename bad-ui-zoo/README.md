# Bad UI Zoo

10 common AI UI mistakes as regression fixtures. Each case has `target.png`, `actual.png`, and `expected-findings.json` with score bands.

| Case | Issue |
|------|-------|
| wrong-spacing | Card/hero spacing drift |
| wrong-radius | Border radius too small |
| wrong-font-size | Typography scale off |
| wrong-color-token | Accent color mismatch |
| broken-mobile-safe-area | Bottom safe-area padding |
| shifted-bottom-nav | Navigation region offset |
| oversized-card | Card width/padding |
| missing-shadow | Elevation/shadow |
| wrong-button-height | CTA size/position |
| hero-offset | Hero block vertical offset |

Regenerate:

```bash
pnpm generate-zoo
```

Run tests:

```bash
pnpm --filter @stitchguard/core test
```
