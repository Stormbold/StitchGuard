# Claude Code Workflow

```bash
stitchguard check \
  --target ./design/mobile.png \
  --url http://localhost:3000 \
  --agent claude \
  --mode conservative
```

Claude Code prompts prioritize:

1. Layout spacing
2. Color tokens
3. Typography scale
4. Border radius
5. Bottom navigation / safe-area spacing

Use `--write-agents-md` with `agent-prompt` to generate a project-level `.stitchguard/AGENTS.md` for Claude Code sessions.
