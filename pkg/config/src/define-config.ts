import type { IgnoreRegion, Viewport } from '@stitchguard/core';

export type AgentTarget = 'codex' | 'cursor' | 'claude';
export type PromptMode = 'conservative' | 'strict' | 'refactor-safe';
export type PromptStack = 'generic' | 'nextjs-tailwind' | 'shadcn';

export type StitchGuardConfig = {
  outputDir?: string;
  threshold?: number;
  viewport?: Viewport;
  compare?: {
    includeAntiAliasing?: boolean;
    diffColor?: string;
    ignoreRegions?: IgnoreRegion[];
  };
  agent?: {
    target?: AgentTarget;
    mode?: PromptMode;
    stack?: PromptStack;
  };
  routes?: string[];
};

export function defineConfig(config: StitchGuardConfig): StitchGuardConfig {
  return config;
}

export const DEFAULT_CONFIG: StitchGuardConfig = {
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
    stack: 'generic',
  },
  routes: ['/'],
};
