import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { CompareResult } from '@stitchguard/core';
import {
  generateAgentPrompt,
  generateProjectAgentsMd,
  getAgentPromptFilename,
  type AgentTarget,
  type GeneratePromptOptions,
} from '@stitchguard/agent-prompts';
import { generateMarkdownReport, generateCiSummary } from './markdown.js';
import { serializeJsonReport } from './json.js';

export type WriteReportsOptions = {
  agent?: AgentTarget;
  promptOptions?: GeneratePromptOptions;
  writeProjectAgentsMd?: boolean;
  promptsDir?: string;
};

export async function writeReports(
  result: CompareResult,
  options: WriteReportsOptions = {},
): Promise<CompareResult> {
  const agent = options.agent ?? 'codex';
  const outputDir = path.dirname(result.artifacts.reportPath);

  await mkdir(outputDir, { recursive: true });

  const reportMd = generateMarkdownReport(result);
  const json = serializeJsonReport(result);
  const agentPrompt = generateAgentPrompt(result, {
    ...options.promptOptions,
    agent,
  });

  const agentPromptPath = path.join(outputDir, getAgentPromptFilename(agent));

  await writeFile(result.artifacts.reportPath, reportMd);
  await writeFile(result.artifacts.jsonPath, json);
  await writeFile(agentPromptPath, agentPrompt);

  result.artifacts.agentPromptPath = agentPromptPath;

  if (options.writeProjectAgentsMd) {
    const agentsPath = path.join(outputDir, 'AGENTS.md');
    await writeFile(agentsPath, generateProjectAgentsMd(result));
  }

  if (options.promptsDir) {
    await mkdir(options.promptsDir, { recursive: true });
    const agents = ['codex', 'cursor', 'claude'] as const;
    for (const target of agents) {
      const prompt = generateAgentPrompt(result, { ...options.promptOptions, agent: target });
      await writeFile(path.join(options.promptsDir, getAgentPromptFilename(target)), prompt);
    }
  }

  return result;
}

export async function writeCiSummary(
  result: CompareResult,
  outputPath: string,
): Promise<string> {
  const summary = generateCiSummary(result);
  await writeFile(outputPath, summary);
  return summary;
}

export { generateMarkdownReport, generateCiSummary } from './markdown.js';
export { generateJsonReport, serializeJsonReport } from './json.js';
