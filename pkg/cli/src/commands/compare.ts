import path from 'node:path';
import { compareScreenshots, formatPercent, formatScore, riskLevelFromScore } from '@stitchguard/core';
import { writeReports } from '@stitchguard/report';
import type { AgentTarget, PromptMode } from '@stitchguard/agent-prompts';
import {
  detectStackFromPackageJson,
  generateShadcnHints,
  generateTailwindHints,
} from '@stitchguard/agent-prompts';
import { loadConfig, loadPackageJson } from '@stitchguard/config';
import { readFile } from 'node:fs/promises';

export type CompareCommandOptions = {
  outputDir?: string;
  threshold?: number;
  includeAA?: boolean;
  agent?: AgentTarget;
  mode?: PromptMode;
  tailwind?: boolean;
};

export async function runCompare(
  target: string,
  actual: string,
  options: CompareCommandOptions = {},
): Promise<{ result: Awaited<ReturnType<typeof compareScreenshots>>; passed: boolean }> {
  const config = await loadConfig();
  const outputDir = options.outputDir ?? config.outputDir ?? '.stitchguard';
  const threshold = options.threshold ?? config.threshold ?? 0.85;

  const targetPath = path.resolve(target);
  const actualPath = path.resolve(actual);

  const result = await compareScreenshots({
    targetPath,
    actualPath,
    outputDir,
    threshold,
    includeAA: options.includeAA ?? config.compare?.includeAntiAliasing,
    viewport: config.viewport,
    ignoreRegions: config.compare?.ignoreRegions,
  });

  let tailwindHints: string[] | undefined;

  if (options.tailwind ?? config.agent?.stack?.includes('tailwind')) {
    tailwindHints = generateTailwindHints({ findings: result.findings });
    const colorFinding = result.findings.find((f) => f.type === 'color');
    if (colorFinding) {
      const hexMatches = colorFinding.message.match(/`(#\w+)`/g);
      if (hexMatches && hexMatches.length >= 2) {
        tailwindHints = generateTailwindHints({
          findings: result.findings,
          targetAccent: hexMatches[0]?.replace(/`/g, ''),
          actualAccent: hexMatches[1]?.replace(/`/g, ''),
        });
      }
    }

    const pkg = await loadPackageJson();
    if (pkg) {
      const stack = detectStackFromPackageJson(JSON.stringify(pkg));
      if (stack.hasShadcn) {
        tailwindHints.push(...generateShadcnHints(result.findings));
      }
    }
  }

  await writeReports(result, {
    agent: options.agent ?? config.agent?.target ?? 'codex',
    promptOptions: {
      mode: options.mode ?? config.agent?.mode ?? 'conservative',
      stack: config.agent?.stack ?? 'generic',
      tailwindHints,
    },
    writeProjectAgentsMd: Boolean(options.agent),
    promptsDir: options.agent ? path.join(outputDir, 'prompts') : undefined,
  });

  printSummary(result, threshold);

  return {
    result,
    passed: result.score >= threshold,
  };
}

function printSummary(
  result: Awaited<ReturnType<typeof compareScreenshots>>,
  threshold: number,
): void {
  const viewport = result.viewport
    ? `${result.viewport.width}x${result.viewport.height}`
    : `${result.dimensions.width}x${result.dimensions.height}`;

  console.log('');
  console.log('StitchGuard Report');
  console.log('');
  console.log(`Target: ${path.basename(result.target)}`);
  console.log(`Actual: ${path.basename(result.actual)}`);
  console.log(`Viewport: ${viewport}`);
  console.log(`Visual Match: ${formatScore(result.score)}`);
  console.log(`Changed Pixels: ${formatPercent(result.changedRatio)}`);
  console.log(`Risk Level: ${riskLevelFromScore(result.score)}`);
  console.log(`Threshold: ${formatScore(threshold)}`);
  console.log(`Status: ${result.score >= threshold ? 'Pass' : 'Needs Work'}`);
  console.log('');
  console.log('Generated:');
  console.log(`✓ ${result.artifacts.diffPath}`);
  console.log(`✓ ${result.artifacts.heatmapPath}`);
  console.log(`✓ ${result.artifacts.reportPath}`);
  console.log(`✓ ${result.artifacts.agentPromptPath}`);
  console.log(`✓ ${result.artifacts.jsonPath}`);
  console.log('');
}

export async function loadResultFromFile(reportPath: string) {
  const content = await readFile(reportPath, 'utf8');
  return JSON.parse(content) as Awaited<ReturnType<typeof compareScreenshots>>;
}
