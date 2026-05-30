import { describe, expect, it } from 'vitest';
import {
  generateAgentPrompt,
  formatFindingsList,
  getSuggestedFixDirections,
  generateTailwindHints,
} from '../src/index.js';
import type { CompareResult } from '@stitchguard/core';

const mockResult: CompareResult = {
  version: '0.1.0',
  target: 'design.png',
  actual: 'actual.png',
  score: 0.824,
  changedPixels: 1000,
  changedRatio: 0.176,
  totalPixels: 5684,
  status: 'needs_work',
  dimensions: { width: 390, height: 844 },
  artifacts: {
    diffPath: '.stitchguard/diff.png',
    heatmapPath: '.stitchguard/heatmap.png',
    reportPath: '.stitchguard/report.md',
    jsonPath: '.stitchguard/result.json',
    agentPromptPath: '.stitchguard/codex-fix-prompt.md',
  },
  findings: [
    {
      type: 'layout',
      severity: 'high',
      region: 'upper-content',
      message: 'The largest visual difference appears in the upper-content region.',
      confidence: 0.81,
    },
    {
      type: 'color',
      severity: 'medium',
      message: 'Target dominant accent appears close to `#CF98AF`. Actual dominant accent appears close to `#D184A1`.',
      confidence: 0.74,
    },
  ],
  diffBuffer: Buffer.alloc(0),
  heatmapBuffer: Buffer.alloc(0),
};

describe('agent prompts', () => {
  it('generates codex prompt with conservative rules', () => {
    const prompt = generateAgentPrompt(mockResult, { agent: 'codex' });
    expect(prompt).toContain('# Codex Visual Repair Task');
    expect(prompt).toContain('Do not rewrite the whole app');
    expect(prompt).toContain('Visual Match: 82.4%');
    expect(prompt).toContain('upper-content');
  });

  it('generates cursor-specific guidance', () => {
    const prompt = generateAgentPrompt(mockResult, { agent: 'cursor' });
    expect(prompt).toContain('# Cursor Visual Repair Task');
    expect(prompt).toContain('Do not refactor unrelated files');
  });

  it('formats findings as numbered list', () => {
    const list = formatFindingsList(mockResult.findings);
    expect(list).toHaveLength(2);
    expect(list[0]).toMatch(/^1\./);
  });

  it('suggests fix directions from findings', () => {
    const directions = getSuggestedFixDirections(mockResult.findings);
    expect(directions.some((d) => d.includes('hero/header'))).toBe(true);
    expect(directions.some((d) => d.includes('color tokens'))).toBe(true);
  });

  it('generates tailwind hints without claiming exact DOM mapping', () => {
    const hints = generateTailwindHints({
      findings: mockResult.findings,
      targetAccent: '#CF98AF',
      actualAccent: '#D184A1',
    });
    expect(hints.some((h) => h.includes('Inspect border radius'))).toBe(true);
    expect(hints.some((h) => h.includes('Inspect primary/accent'))).toBe(true);
    expect(hints.every((h) => !h.includes('Change exactly'))).toBe(true);
  });
});
