# Cursor Workflow

Cursor works best with project context. StitchGuard generates a Cursor-specific prompt that emphasizes minimal, in-project edits.

```bash
stitchguard compare design.png actual.png --agent cursor
```

Or regenerate from an existing report:

```bash
stitchguard agent-prompt --agent cursor --report .stitchguard/result.json
```

The Cursor prompt tells the agent:

- Do not refactor unrelated files
- Only adjust styles/layout for reported differences
- Re-run the app and capture a new screenshot after changes
