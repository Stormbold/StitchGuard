import { describe, expect, it } from 'vitest';
import { generateMarkdownReport, serializeJsonReport } from '../src/index.js';
import type { CompareResult } from '@stitchguard/core';

const mockResult: CompareResult = {
  version: '0.1.0',
  target: 'design.png',
  actual: 'actual.png',
  viewport: { width: 390, height: 844 },
  score: 0.824,
  changedPixels: 45672,
  changedRatio: 0.138,
  totalPixels: 329160,
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
  ],
  diffBuffer: Buffer.alloc(0),
  heatmapBuffer: Buffer.alloc(0),
};

describe('report generation', () => {
  it('generates stable markdown report', () => {
    const report = generateMarkdownReport(mockResult);
    expect(report).toContain('# StitchGuard Report');
    expect(report).toContain('Visual Match: `82.4%`');
    expect(report).toContain('upper-content');
    expect(report).toContain('codex-fix-prompt.md');
  });

  it('generates valid json report', () => {
    const json = serializeJsonReport(mockResult);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe('0.1.0');
    expect(parsed.score).toBe(0.824);
    expect(parsed.findings).toHaveLength(1);
  });
});
