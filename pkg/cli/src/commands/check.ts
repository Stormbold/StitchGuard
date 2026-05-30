import path from 'node:path';
import { compareScreenshots } from '@stitchguard/core';
import { writeReports } from '@stitchguard/report';
import { captureUrl, closeBrowser, getDevicePreset, parseViewport } from '@stitchguard/capture';
import type { AgentTarget, PromptMode } from '@stitchguard/agent-prompts';
import {
  detectStackFromPackageJson,
  generateShadcnHints,
  generateTailwindHints,
} from '@stitchguard/agent-prompts';
import { loadConfig, loadPackageJson } from '@stitchguard/config';
import { formatPercent, formatScore, riskLevelFromScore } from '@stitchguard/core';

export type CheckCommandOptions = {
  target: string;
  url: string;
  outputDir?: string;
  threshold?: number;
  viewport?: string;
  device?: string;
  wait?: number;
  fullPage?: boolean;
  includeAA?: boolean;
  agent?: AgentTarget;
  mode?: PromptMode;
  tailwind?: boolean;
  colorScheme?: 'light' | 'dark';
};

export async function runCheck(
  options: CheckCommandOptions,
): Promise<{ passed: boolean; score: number }> {
  const config = await loadConfig();
  const outputDir = options.outputDir ?? config.outputDir ?? '.stitchguard';
  const threshold = options.threshold ?? config.threshold ?? 0.85;
  const targetPath = path.resolve(options.target);
  const actualPath = path.join(outputDir, 'actual.png');

  let viewport = config.viewport ?? { width: 390, height: 844 };
  let deviceScaleFactor = 1;

  if (options.device) {
    const preset = getDevicePreset(options.device);
    viewport = preset.viewport;
    deviceScaleFactor = preset.deviceScaleFactor ?? 1;
  } else if (options.viewport) {
    viewport = parseViewport(options.viewport);
  }

  try {
    await captureUrl({
      url: options.url,
      outputPath: actualPath,
      viewport,
      waitMs: options.wait ?? 1000,
      fullPage: options.fullPage ?? false,
      colorScheme: options.colorScheme ?? 'light',
      deviceScaleFactor,
    });

    const result = await compareScreenshots({
      targetPath,
      actualPath,
      outputDir,
      threshold,
      includeAA: options.includeAA ?? config.compare?.includeAntiAliasing,
      viewport,
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

    printCheckSummary(result, threshold, options.url);

    return { passed: result.score >= threshold, score: result.score };
  } finally {
    await closeBrowser();
  }
}

function printCheckSummary(
  result: Awaited<ReturnType<typeof compareScreenshots>>,
  threshold: number,
  url: string,
): void {
  const viewport = result.viewport
    ? `${result.viewport.width}x${result.viewport.height}`
    : `${result.dimensions.width}x${result.dimensions.height}`;

  console.log('');
  console.log('StitchGuard Check Report');
  console.log('');
  console.log(`Target: ${path.basename(result.target)}`);
  console.log(`URL: ${url}`);
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
