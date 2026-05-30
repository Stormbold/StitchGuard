import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const STITCHGUARD_DIR = '.stitchguard';

const AGENT_RULES = `# StitchGuard Agent Rules

You are fixing visual fidelity — not rebuilding the app.

## Rules

- Do not rewrite the whole app.
- Do not change copy/text unless explicitly needed.
- Do not add new features or change routing.
- Focus on spacing, colors, border radius, typography, and safe-area padding.
- Prefer small, targeted style changes.
- Re-run StitchGuard after edits to verify improvement.

## Workflow

1. Read \`.stitchguard/report.md\` and the fix prompt in \`.stitchguard/prompts/\`.
2. Apply conservative visual fixes only.
3. Capture a new screenshot or run \`stitchguard check\`.
4. Compare scores — stop when match is acceptable.
`;

const CODEX_PROMPT_TEMPLATE = `# Codex Visual Fix (StitchGuard)

Use \`.stitchguard/report.md\` and \`.stitchguard/result.json\` as the source of truth.

Apply a conservative visual repair pass. Do not refactor unrelated code.

After changes, ask the user to re-run StitchGuard compare/check.
`;

const CURSOR_PROMPT_TEMPLATE = `# Cursor Visual Fix (StitchGuard)

Inspect UI files related to the findings in \`.stitchguard/report.md\`.

Make minimal layout/style adjustments. Do not redesign components.

Re-run StitchGuard to confirm the visual match improved.
`;

export type InitAgentOptions = {
  writeAgentsMd?: boolean;
  outputDir?: string;
};

export async function runInitAgent(options: InitAgentOptions = {}): Promise<void> {
  const base = path.resolve(options.outputDir ?? STITCHGUARD_DIR);
  const promptsDir = path.join(base, 'prompts');

  await mkdir(promptsDir, { recursive: true });

  await writeFile(path.join(base, 'agent-rules.md'), AGENT_RULES);
  await writeFile(path.join(promptsDir, 'codex-visual-fix.md'), CODEX_PROMPT_TEMPLATE);
  await writeFile(path.join(promptsDir, 'cursor-visual-fix.md'), CURSOR_PROMPT_TEMPLATE);

  console.log(`Created ${base}/agent-rules.md`);
  console.log(`Created ${promptsDir}/codex-visual-fix.md`);
  console.log(`Created ${promptsDir}/cursor-visual-fix.md`);

  if (options.writeAgentsMd) {
    const agentsMd = `# Visual Fidelity (StitchGuard)

See \`.stitchguard/agent-rules.md\` for visual repair guidelines.

When StitchGuard reports differences, read \`.stitchguard/prompts/codex-visual-fix.md\` (or cursor variant) before editing.
`;
    await writeFile('AGENTS.md', agentsMd);
    console.log('Created AGENTS.md (opt-in)');
  }
}
