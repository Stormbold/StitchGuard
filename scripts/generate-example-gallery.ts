/**
 * Generates example gallery folders with PNGs and StitchGuard artifacts.
 * Requires: pnpm build (uses compiled CLI).
 */
import { execSync } from 'node:child_process';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type MockVariant, renderMockPair } from './mock-ui.js';

const EXAMPLES: Array<{ id: MockVariant; readme: string }> = [
  {
    id: 'google-stitch-to-codex',
    readme: `# Google Stitch → Codex

1. Design exported from Google Stitch as \`target.png\`
2. Codex built a Next.js UI — close, but visibly off (\`actual.png\`)
3. StitchGuard compares both and generates a repair prompt for Codex
`,
  },
  {
    id: 'shadcn-dashboard',
    readme: `# shadcn Dashboard\n\nCard radius and button width differ from target.\n`,
  },
  {
    id: 'landing-page',
    readme: `# Landing Page Hero\n\nHero section spacing differs from target.\n`,
  },
  {
    id: 'broken-tailwind-card',
    readme: `# Broken Tailwind Card\n\nPadding and CTA width differ from target.\n`,
  },
];

async function generateExample(id: MockVariant, readme: string): Promise<void> {
  const dir = path.resolve('examples', id);
  await mkdir(dir, { recursive: true });

  const { target, actual } = renderMockPair(id);
  const targetPath = path.join(dir, 'target.png');
  const actualPath = path.join(dir, 'actual.png');

  await writeFile(targetPath, target);
  await writeFile(actualPath, actual);

  const tmpOut = path.join(dir, '.artifacts');
  execSync(
    `node packages/cli/dist/index.js compare "${targetPath}" "${actualPath}" -o "${tmpOut}" --threshold 0.5`,
    { stdio: 'inherit', cwd: path.resolve('.') },
  );

  for (const name of ['diff.png', 'heatmap.png', 'report.md', 'result.json', 'codex-fix-prompt.md']) {
    await cp(path.join(tmpOut, name), path.join(dir, name));
  }

  await writeFile(path.join(dir, 'README.md'), readme);
  console.log(`Generated examples/${id}/`);
}

async function main(): Promise<void> {
  for (const example of EXAMPLES) {
    await generateExample(example.id, example.readme);
  }

  const screenshotsDir = path.resolve('examples/screenshots');
  await mkdir(screenshotsDir, { recursive: true });
  const flagship = renderMockPair('google-stitch-to-codex');
  await writeFile(path.join(screenshotsDir, 'target.png'), flagship.target);
  await writeFile(path.join(screenshotsDir, 'actual.png'), flagship.actual);

  const webDemoSamples = path.resolve('packages/web-demo/public/samples');
  await mkdir(webDemoSamples, { recursive: true });
  await writeFile(path.join(webDemoSamples, 'target.png'), flagship.target);
  await writeFile(path.join(webDemoSamples, 'actual.png'), flagship.actual);
  await cp(
    path.join('examples', 'google-stitch-to-codex', 'codex-fix-prompt.md'),
    path.join(webDemoSamples, 'codex-fix-prompt.md'),
  );

  console.log('Example gallery generated.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
