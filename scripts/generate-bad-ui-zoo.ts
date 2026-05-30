/**
 * Generates bad-ui-zoo fixtures and expected score bands.
 */
import { execSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type ZooCase, renderZooPair } from './mock-ui.js';

const ZOO_CASES: ZooCase[] = [
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
];

const DESCRIPTIONS: Record<ZooCase, string> = {
  'wrong-spacing': 'Card and hero spacing differ from target.',
  'wrong-radius': 'Border radius appears smaller than target.',
  'wrong-font-size': 'Typography scale differs from target.',
  'wrong-color-token': 'Primary accent color differs from target.',
  'broken-mobile-safe-area': 'Bottom safe-area padding differs from target.',
  'shifted-bottom-nav': 'Bottom navigation region differs from target.',
  'oversized-card': 'Card width/padding differs from target.',
  'missing-shadow': 'Card elevation/shadow differs from target.',
  'wrong-button-height': 'CTA button size/position differs from target.',
  'hero-offset': 'Hero block appears vertically offset from target.',
};

async function generateCase(caseId: ZooCase): Promise<void> {
  const dir = path.resolve('bad-ui-zoo', caseId);
  await mkdir(dir, { recursive: true });

  const { target, actual } = renderZooPair(caseId);
  const targetPath = path.join(dir, 'target.png');
  const actualPath = path.join(dir, 'actual.png');

  await writeFile(targetPath, target);
  await writeFile(actualPath, actual);

  const outDir = path.join(dir, '.out');
  execSync(
    `node packages/cli/dist/index.js compare "${targetPath}" "${actualPath}" -o "${outDir}" --threshold 0.5`,
    { stdio: 'pipe', cwd: path.resolve('.') },
  );

  const result = JSON.parse(await readFile(path.join(outDir, 'result.json'), 'utf8')) as {
    score: number;
    findings: Array<{ region?: string; type: string }>;
  };

  const expected = {
    minScore: Math.max(0, result.score - 0.15),
    maxScore: Math.min(1, result.score + 0.05),
    topRegions: result.findings
      .filter((f) => f.region)
      .slice(0, 3)
      .map((f) => f.region),
  };

  await writeFile(path.join(dir, 'expected-findings.json'), `${JSON.stringify(expected, null, 2)}\n`);
  await writeFile(
    path.join(dir, 'README.md'),
    `# ${caseId}\n\n${DESCRIPTIONS[caseId]}\n\nExpected score band: ${(expected.minScore * 100).toFixed(0)}–${(expected.maxScore * 100).toFixed(0)}%\n`,
  );

  console.log(`Generated bad-ui-zoo/${caseId}/`);
}

async function main(): Promise<void> {
  for (const caseId of ZOO_CASES) {
    await generateCase(caseId);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
