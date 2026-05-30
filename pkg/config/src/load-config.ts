import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEFAULT_CONFIG, type StitchGuardConfig } from './define-config.js';

const CONFIG_FILENAMES = [
  'stitchguard.config.ts',
  'stitchguard.config.mts',
  'stitchguard.config.js',
  'stitchguard.config.mjs',
];

export async function loadConfig(cwd = process.cwd()): Promise<StitchGuardConfig> {
  for (const filename of CONFIG_FILENAMES) {
    const configPath = path.join(cwd, filename);
    try {
      await access(configPath);
      const imported = await import(pathToFileURL(configPath).href);
      const config = imported.default ?? imported.config;
      if (config) {
        return mergeConfig(DEFAULT_CONFIG, config as StitchGuardConfig);
      }
    } catch {
      // try next filename
    }
  }

  return { ...DEFAULT_CONFIG };
}

export async function loadPackageJson(cwd = process.cwd()): Promise<Record<string, unknown> | null> {
  try {
    const content = await readFile(path.join(cwd, 'package.json'), 'utf8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mergeConfig(
  base: StitchGuardConfig,
  override: StitchGuardConfig,
): StitchGuardConfig {
  return {
    ...base,
    ...override,
    viewport:
      base.viewport && override.viewport
        ? { width: override.viewport.width ?? base.viewport.width, height: override.viewport.height ?? base.viewport.height }
        : override.viewport ?? base.viewport,
    compare: { ...base.compare, ...override.compare },
    agent: { ...base.agent, ...override.agent },
    routes: override.routes ?? base.routes,
  };
}

export function generateConfigTemplate(): string {
  return `import { defineConfig } from '@stitchguard/config';

export default defineConfig({
  outputDir: '.stitchguard',
  threshold: 0.85,
  viewport: {
    width: 390,
    height: 844,
  },
  compare: {
    includeAntiAliasing: false,
    diffColor: '#ff00ff',
    ignoreRegions: [],
  },
  agent: {
    target: 'codex',
    mode: 'conservative',
    stack: 'nextjs-tailwind',
  },
  routes: ['/'],
});
`;
}
