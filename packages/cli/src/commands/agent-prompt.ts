import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  generateAgentPrompt,
  getAgentPromptFilename,
  type AgentTarget,
  type PromptMode,
} from '@stitchguard/agent-prompts';
import type { CompareResult } from '@stitchguard/core';
import { loadConfig } from '@stitchguard/config';

export type AgentPromptOptions = {
  agent?: AgentTarget;
  mode?: PromptMode;
  output?: string;
};

export async function runAgentPrompt(
  reportPath: string,
  options: AgentPromptOptions = {},
): Promise<void> {
  const config = await loadConfig();
  const resolved = path.resolve(reportPath);
  const content = await readFile(resolved, 'utf8');
  const result = JSON.parse(content) as CompareResult;

  const agent = options.agent ?? config.agent?.target ?? 'codex';
  const mode = options.mode ?? config.agent?.mode ?? 'conservative';

  const prompt = generateAgentPrompt(result, { agent, mode });
  const outputPath =
    options.output ??
    path.join(path.dirname(resolved), getAgentPromptFilename(agent));

  await writeFile(outputPath, prompt);
  console.log(`Generated ${outputPath}`);
}
