import type { PixelDiffResult, RegionDiff, VisualFinding, VisualRegion } from './types.js';
import { REGION_DESCRIPTIONS, REGION_LABELS } from './types.js';

const VERTICAL_REGIONS: Array<{ region: VisualRegion; startRatio: number; endRatio: number }> = [
  { region: 'header', startRatio: 0, endRatio: 0.12 },
  { region: 'upper-content', startRatio: 0.12, endRatio: 0.35 },
  { region: 'middle-content', startRatio: 0.35, endRatio: 0.6 },
  { region: 'lower-content', startRatio: 0.6, endRatio: 0.85 },
  { region: 'bottom', startRatio: 0.85, endRatio: 1 },
];

export function analyzeRegions(
  diffResult: PixelDiffResult,
  width: number,
  height: number,
): RegionDiff[] {
  return VERTICAL_REGIONS.map(({ region, startRatio, endRatio }) => {
    const yStart = Math.floor(height * startRatio);
    const yEnd = Math.ceil(height * endRatio);
    let changedPixels = 0;
    let totalPixels = 0;

    for (let y = yStart; y < yEnd; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        totalPixels += 1;
        if (diffResult.mismatchMap[index] === 1) {
          changedPixels += 1;
        }
      }
    }

    return {
      region,
      changedPixels,
      totalPixels,
      changedRatio: totalPixels === 0 ? 0 : changedPixels / totalPixels,
    };
  });
}

export function analyzeGridRegions(
  diffResult: PixelDiffResult,
  width: number,
  height: number,
  gridSize: 3 | 4 = 3,
): RegionDiff[] {
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  const regions: RegionDiff[] = [];

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const xStart = Math.floor(col * cellWidth);
      const yStart = Math.floor(row * cellHeight);
      const xEnd = Math.ceil((col + 1) * cellWidth);
      const yEnd = Math.ceil((row + 1) * cellHeight);
      let changedPixels = 0;
      let totalPixels = 0;

      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          const index = y * width + x;
          totalPixels += 1;
          if (diffResult.mismatchMap[index] === 1) {
            changedPixels += 1;
          }
        }
      }

      regions.push({
        region: `grid-${row + 1}-${col + 1}` as VisualRegion,
        changedPixels,
        totalPixels,
        changedRatio: totalPixels === 0 ? 0 : changedPixels / totalPixels,
      });
    }
  }

  return regions;
}

function severityFromRatio(ratio: number): VisualFinding['severity'] {
  if (ratio >= 0.25) return 'high';
  if (ratio >= 0.12) return 'medium';
  return 'low';
}

function confidenceFromRatio(ratio: number): number {
  return Math.min(0.95, Math.max(0.55, 0.55 + ratio * 1.5));
}

export function regionDiffsToFindings(regionDiffs: RegionDiff[]): VisualFinding[] {
  const sorted = [...regionDiffs]
    .filter((region) => !String(region.region).startsWith('grid-'))
    .sort((a, b) => b.changedRatio - a.changedRatio);

  const findings: VisualFinding[] = [];

  for (const region of sorted) {
    if (region.changedRatio < 0.05) continue;

    const severity = severityFromRatio(region.changedRatio);
    const label = REGION_LABELS[region.region as VisualRegion] ?? region.region;
    const description =
      REGION_DESCRIPTIONS[region.region as VisualRegion] ??
      `The ${label} region differs from the target.`;

    findings.push({
      type: 'layout',
      severity,
      region: region.region,
      message: description,
      confidence: confidenceFromRatio(region.changedRatio),
    });
  }

  return findings.slice(0, 5);
}

export function getTopRegion(regionDiffs: RegionDiff[]): RegionDiff | undefined {
  return [...regionDiffs]
    .filter((region) => !String(region.region).startsWith('grid-'))
    .sort((a, b) => b.changedRatio - a.changedRatio)[0];
}
