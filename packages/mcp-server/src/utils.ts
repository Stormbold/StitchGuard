import { readFile } from 'node:fs/promises';
import type { CompareResult } from '@stitchguard/core';

export async function readJsonResult(resultPath: string): Promise<CompareResult> {
  const content = await readFile(resultPath, 'utf8');
  return JSON.parse(content) as CompareResult;
}
