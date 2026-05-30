import type { CompareResult } from '@stitchguard/core';
import {
  generateAgentPrompt,
  type GeneratePromptOptions,
} from './shared.js';

export function generateCursorPrompt(
  result: CompareResult,
  options: Omit<GeneratePromptOptions, 'agent'> = {},
): string {
  return generateAgentPrompt(result, { ...options, agent: 'cursor' });
}
