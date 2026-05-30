# Thresholds

StitchGuard uses a configurable pass threshold for CI and local checks.

## Presets

| Mode | Threshold | Use case |
|------|-----------|----------|
| loose | 0.75 | Early prototyping |
| normal | 0.85 | Default |
| strict | 0.92 | Design-critical screens |
| pixel-perfect | 0.97 | Very tight visual QA |

## CLI

```bash
stitchguard compare design.png actual.png --threshold 0.92
stitchguard check --target design.png --url http://localhost:3000 --threshold 0.90
```

## Config file

```typescript
export default defineConfig({
  threshold: 0.85,
});
```

Exit code is `0` when score >= threshold, `1` otherwise.
