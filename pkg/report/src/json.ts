import type { CompareResult } from '@stitchguard/core';

export type ResultJson = {
  version: string;
  target: string;
  actual: string;
  viewport?: {
    width: number;
    height: number;
  };
  score: number;
  changedPixels: number;
  changedRatio: number;
  totalPixels: number;
  status: CompareResult['status'];
  dimensions: CompareResult['dimensions'];
  findings: CompareResult['findings'];
};

export function generateJsonReport(result: CompareResult): ResultJson {
  return {
    version: result.version,
    target: result.target,
    actual: result.actual,
    viewport: result.viewport,
    score: result.score,
    changedPixels: result.changedPixels,
    changedRatio: result.changedRatio,
    totalPixels: result.totalPixels,
    status: result.status,
    dimensions: result.dimensions,
    findings: result.findings,
  };
}

export function serializeJsonReport(result: CompareResult): string {
  return `${JSON.stringify(generateJsonReport(result), null, 2)}\n`;
}
