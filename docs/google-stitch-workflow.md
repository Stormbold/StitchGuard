# Google Stitch Workflow

StitchGuard is generic — it works with any design screenshot source, including Google Stitch, Figma exports, v0, Lovable, or Bolt.

## Typical flow

1. Export your Stitch design as a mobile PNG (e.g. 390×844).
2. Build the UI with Codex/Cursor/Claude Code.
3. Run StitchGuard check against your dev server.
4. Feed the repair prompt back to your agent.
5. Repeat until visual match is acceptable.

```bash
stitchguard check \
  --target ./design/stitch-mobile.png \
  --url http://localhost:3000 \
  --viewport 390x844 \
  --agent codex
```

StitchGuard is **not** affiliated with Google Stitch.
