import { describe, expect, it } from 'vitest';
import {
  calculateScore,
  calculateChangedRatio,
  scoreToStatus,
  formatScore,
  computePixelDiff,
  analyzeRegions,
  regionDiffsToFindings,
  compareColors,
  normalizeImages,
} from '../src/index.js';
import type { LoadedImage } from '../src/types.js';

function createSolidImage(width: number, height: number, color: [number, number, number, number]): LoadedImage {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  }
  return { data, width, height };
}

describe('scoring', () => {
  it('returns 100% for identical images', () => {
    expect(calculateScore(0, 100)).toBe(1);
    expect(formatScore(1)).toBe('100.0%');
  });

  it('calculates changed ratio correctly', () => {
    expect(calculateChangedRatio(25, 100)).toBe(0.25);
    expect(calculateScore(25, 100)).toBe(0.75);
  });

  it('maps score to status buckets', () => {
    expect(scoreToStatus(0.95)).toBe('excellent');
    expect(scoreToStatus(0.87)).toBe('acceptable');
    expect(scoreToStatus(0.75)).toBe('needs_work');
    expect(scoreToStatus(0.5)).toBe('fail');
  });
});

describe('pixel diff', () => {
  it('detects no changes for identical images', () => {
    const image = createSolidImage(10, 10, [255, 0, 0, 255]);
    const diff = computePixelDiff(image, image);
    expect(diff.changedPixels).toBe(0);
  });

  it('detects changes for different images', () => {
    const target = createSolidImage(10, 10, [255, 0, 0, 255]);
    const actual = createSolidImage(10, 10, [0, 0, 255, 255]);
    const diff = computePixelDiff(target, actual);
    expect(diff.changedPixels).toBeGreaterThan(0);
  });
});

describe('region analysis', () => {
  it('finds differences concentrated in upper region', () => {
    const width = 100;
    const height = 100;
    const target = createSolidImage(width, height, [255, 255, 255, 255]);
    const actual = createSolidImage(width, height, [255, 255, 255, 255]);

    for (let y = 12; y < 35; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        actual.data[index] = 0;
        actual.data[index + 1] = 0;
        actual.data[index + 2] = 255;
      }
    }

    const diff = computePixelDiff(target, actual);
    const regions = analyzeRegions(diff, width, height);
    const findings = regionDiffsToFindings(regions);

    expect(findings.some((finding) => finding.region === 'upper-content')).toBe(true);
  });
});

describe('color analysis', () => {
  it('detects accent color shift', () => {
    const target = createSolidImage(20, 20, [200, 100, 150, 255]);
    const actual = createSolidImage(20, 20, [100, 200, 50, 255]);
    const comparison = compareColors(target, actual);
    expect(comparison.accentShift).toBeDefined();
  });
});

describe('normalize', () => {
  it('pads smaller image onto shared canvas', () => {
    const target = createSolidImage(50, 50, [255, 0, 0, 255]);
    const actual = createSolidImage(80, 60, [0, 255, 0, 255]);
    const normalized = normalizeImages(target, actual);
    expect(normalized.width).toBe(80);
    expect(normalized.height).toBe(60);
  });
});
