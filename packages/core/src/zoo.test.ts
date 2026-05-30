import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { compareScreenshots } from '../src/compare.js';

const ZOO_ROOT = path.resolve(import.meta.dirname, '../../../bad-ui-zoo');

const CASES = [
  'wrong-spacing',
  'wrong-radius',
  'wrong-font-size',
  'wrong-color-token',
  'broken-mobile-safe-area',
  'shifted-bottom-nav',
  'oversized-card',
  'missing-shadow',
  'wrong-button-height',
  'hero-offset',
] as const;

describe('bad-ui-zoo regression fixtures', () => {
  for (const caseId of CASES) {
    it(`detects expected score band for ${caseId}`, async () => {
      const caseDir = path.join(ZOO_ROOT, caseId);
      const expectedPath = path.join(caseDir, 'expected-findings.json');

      let expected: { minScore: number; maxScore: number; topRegions?: string[] };
      try {
        expected = JSON.parse(await readFile(expectedPath, 'utf8')) as typeof expected;
      } catch {
        // Fixture not generated yet — skip until pnpm generate-zoo
        return;
      }

      const outDir = path.join(caseDir, '.vitest-out');
      const result = await compareScreenshots({
        targetPath: path.join(caseDir, 'target.png'),
        actualPath: path.join(caseDir, 'actual.png'),
        outputDir: outDir,
        threshold: 0.5,
      });

      expect(result.score).toBeGreaterThanOrEqual(expected.minScore);
      expect(result.score).toBeLessThanOrEqual(expected.maxScore);
      expect(result.findings.length).toBeGreaterThan(0);
    });
  }
});
