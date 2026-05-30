import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { compareScreenshots } from '@stitchguard/core';
import { writeReports, generateMarkdownReport } from '@stitchguard/report';
import { generateAgentPrompt } from '@stitchguard/agent-prompts';
import { captureUrl, closeBrowser } from '@stitchguard/capture';
import { readJsonResult } from './utils.js';

export async function runTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'stitchguard_capture_url': {
      const url = String(args.url);
      const outputPath = path.resolve(String(args.outputPath));
      const viewport = String(args.viewport ?? '390x844');
      const [width, height] = viewport.split('x').map(Number);
      try {
        const saved = await captureUrl({
          url,
          outputPath,
          viewport: { width: width!, height: height! },
          waitMs: typeof args.waitMs === 'number' ? args.waitMs : 1000,
        });
        return JSON.stringify({ path: saved }, null, 2);
      } finally {
        await closeBrowser();
      }
    }
    case 'stitchguard_compare_images': {
      const outputDir = path.resolve(String(args.outputDir ?? '.stitchguard'));
      const threshold = typeof args.threshold === 'number' ? args.threshold : 0.85;
      const result = await compareScreenshots({
        targetPath: path.resolve(String(args.targetPath)),
        actualPath: path.resolve(String(args.actualPath)),
        outputDir,
        threshold,
      });
      await writeReports(result, { agent: 'codex' });
      return JSON.stringify(
        {
          score: result.score,
          status: result.status,
          passed: result.score >= threshold,
          artifacts: result.artifacts,
          findings: result.findings.slice(0, 5),
        },
        null,
        2,
      );
    }
    case 'stitchguard_generate_report': {
      const result = await readJsonResult(String(args.resultPath));
      return generateMarkdownReport(result);
    }
    case 'stitchguard_generate_codex_prompt': {
      const result = await readJsonResult(String(args.resultPath));
      const agent = (args.agent as 'codex' | 'cursor' | 'claude') ?? 'codex';
      return generateAgentPrompt(result, { agent });
    }
    case 'stitchguard_list_artifacts': {
      const dir = path.resolve(String(args.outputDir ?? '.stitchguard'));
      const entries = await readdir(dir, { withFileTypes: true });
      const files = entries.filter((e) => e.isFile()).map((e) => e.name);
      return JSON.stringify({ directory: dir, files }, null, 2);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
