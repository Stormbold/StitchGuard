import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compareColors, colorComparisonToFindings } from './color-analysis.js';
import { loadImage, rawToPngBuffer } from './image-loader.js';
import { applyIgnoreRegions, normalizeImages } from './normalize.js';
import { computePixelDiff, createHeatmap } from './pixel-diff.js';
import { analyzeGridRegions, analyzeRegions, regionDiffsToFindings } from './region-analysis.js';
import {
  calculateChangedRatio,
  calculateScore,
  scoreToStatus,
} from './scoring.js';
import type { CompareInput, CompareResult, VisualFinding } from './types.js';

const VERSION = '0.1.0';
const DEFAULT_OUTPUT_DIR = '.stitchguard';

export async function compareScreenshots(input: CompareInput): Promise<CompareResult> {
  const outputDir = input.outputDir ?? DEFAULT_OUTPUT_DIR;
  const includeAA = input.includeAA ?? false;

  const targetLoaded = await loadImage(input.targetPath);
  const actualLoaded = await loadImage(input.actualPath);

  let normalized = normalizeImages(targetLoaded, actualLoaded);

  if (input.ignoreRegions?.length) {
    normalized = {
      ...normalized,
      ...applyIgnoreRegions(normalized.target, normalized.actual, input.ignoreRegions),
    };
  }

  const diffResult = computePixelDiff(normalized.target, normalized.actual, { includeAA });
  const heatmapBuffer = createHeatmap(
    diffResult.mismatchMap,
    normalized.width,
    normalized.height,
  );

  const totalPixels = normalized.width * normalized.height;
  const changedRatio = calculateChangedRatio(diffResult.changedPixels, totalPixels);
  const score = calculateScore(diffResult.changedPixels, totalPixels);
  const status = scoreToStatus(score);

  const regionDiffs = analyzeRegions(diffResult, normalized.width, normalized.height);
  analyzeGridRegions(diffResult, normalized.width, normalized.height, 3);

  const colorComparison = compareColors(normalized.target, normalized.actual);

  const findings: VisualFinding[] = [
    ...regionDiffsToFindings(regionDiffs),
    ...colorComparisonToFindings(colorComparison),
  ].slice(0, 8);

  await mkdir(outputDir, { recursive: true });

  const diffPath = path.join(outputDir, 'diff.png');
  const heatmapPath = path.join(outputDir, 'heatmap.png');
  const reportPath = path.join(outputDir, 'report.md');
  const jsonPath = path.join(outputDir, 'result.json');
  const agentPromptPath = path.join(outputDir, 'codex-fix-prompt.md');

  const diffBuffer = rawToPngBuffer(diffResult.diff, normalized.width, normalized.height);
  const heatmapPng = rawToPngBuffer(heatmapBuffer, normalized.width, normalized.height);

  await writeFile(diffPath, diffBuffer);
  await writeFile(heatmapPath, heatmapPng);

  return {
    version: VERSION,
    target: input.targetPath,
    actual: input.actualPath,
    viewport: input.viewport,
    score,
    changedPixels: diffResult.changedPixels,
    changedRatio,
    totalPixels,
    status,
    dimensions: {
      width: normalized.width,
      height: normalized.height,
    },
    artifacts: {
      diffPath,
      heatmapPath,
      reportPath,
      jsonPath,
      agentPromptPath,
    },
    findings,
    diffBuffer,
    heatmapBuffer: heatmapPng,
  };
}

export * from './types.js';
export { loadImage, rawToPngBuffer } from './image-loader.js';
export { normalizeImages, applyIgnoreRegions } from './normalize.js';
export { computePixelDiff, createHeatmap } from './pixel-diff.js';
export {
  analyzeRegions,
  analyzeGridRegions,
  regionDiffsToFindings,
  getTopRegion,
} from './region-analysis.js';
export {
  extractDominantColors,
  compareColors,
  colorComparisonToFindings,
} from './color-analysis.js';
export {
  calculateScore,
  calculateChangedRatio,
  scoreToStatus,
  formatScore,
  formatPercent,
  riskLevelFromScore,
} from './scoring.js';
