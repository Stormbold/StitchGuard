import type { CompareStatus } from './types.js';

export function calculateScore(changedPixels: number, totalPixels: number): number {
  if (totalPixels === 0) return 1;
  const changedRatio = changedPixels / totalPixels;
  return clamp(1 - changedRatio, 0, 1);
}

export function calculateChangedRatio(changedPixels: number, totalPixels: number): number {
  if (totalPixels === 0) return 0;
  return changedPixels / totalPixels;
}

export function scoreToStatus(score: number): CompareStatus {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.85) return 'acceptable';
  if (score >= 0.7) return 'needs_work';
  return 'fail';
}

export function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

export function riskLevelFromScore(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 0.9) return 'Low';
  if (score >= 0.8) return 'Medium';
  return 'High';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
