# Codex Workflow

1. Export your target design as a PNG screenshot.
2. Run StitchGuard against your local app or two screenshots.
3. Open `.stitchguard/codex-fix-prompt.md`.
4. Paste the prompt into Codex.
5. Review the conservative visual changes.
6. Re-run StitchGuard and compare scores.

```bash
stitchguard check \
  --target ./design/home.png \
  --url http://localhost:3000 \
  --agent codex \
  --mode conservative
```

The generated prompt instructs Codex to fix only visual mismatches without rewriting the app.
