# MCP Setup

> Playwright MCP controls the browser. StitchGuard MCP validates visual fidelity.

StitchGuard MCP exposes five tools for agent repair loops: capture → compare → report → prompt → list artifacts.

Uses the MCP JSON-RPC protocol over stdio (compatible with Cursor, Claude Desktop, and other MCP clients).

## Install

From the StitchGuard monorepo root:

```bash
pnpm install
pnpm build
```

The server binary is `packages/mcp-server/dist/index.js` (or `pnpm --filter @stitchguard/mcp-server start`).

## Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stitchguard": {
      "command": "node",
      "args": ["/absolute/path/to/StitchGuard/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Claude Desktop

```json
{
  "mcpServers": {
    "stitchguard": {
      "command": "node",
      "args": ["/absolute/path/to/StitchGuard/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Codex / other stdio MCP clients

Same pattern: run `node packages/mcp-server/dist/index.js` over stdio.

## Tools

| Tool | Purpose |
|------|---------|
| `stitchguard_capture_url` | Playwright screenshot of a URL |
| `stitchguard_compare_images` | Full compare pipeline + artifacts |
| `stitchguard_generate_report` | Markdown from `result.json` |
| `stitchguard_generate_codex_prompt` | Agent repair prompt |
| `stitchguard_list_artifacts` | List `.stitchguard/` files |

## Example agent loop

1. `stitchguard_capture_url` → save `actual.png`
2. `stitchguard_compare_images` with `target.png` + `actual.png`
3. `stitchguard_generate_codex_prompt` from `result.json`
4. Agent applies fix
5. Repeat until score improves

## Requirements

- Node.js 20+
- Playwright Chromium for URL capture: `pnpm setup:browser`
