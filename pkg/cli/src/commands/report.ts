import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { generateMarkdownReport } from '@stitchguard/report';
import type { CompareResult } from '@stitchguard/core';

export async function runReport(reportPath: string): Promise<void> {
  const resolved = path.resolve(reportPath);
  const content = await readFile(resolved, 'utf8');
  const result = JSON.parse(content) as CompareResult;
  const markdown = generateMarkdownReport(result);
  console.log(markdown);
}
