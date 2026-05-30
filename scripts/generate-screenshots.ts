/**
 * Generates demo target/actual PNG screenshots for examples and tests.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderMockPair } from './mock-ui.js';

async function main(): Promise<void> {
  const outputDir = path.resolve('examples/screenshots');
  await mkdir(outputDir, { recursive: true });

  const { target, actual } = renderMockPair('google-stitch-to-codex');
  await writeFile(path.join(outputDir, 'target.png'), target);
  await writeFile(path.join(outputDir, 'actual.png'), actual);

  console.log('Generated examples/screenshots/target.png and actual.png');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
