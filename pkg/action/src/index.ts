import * as core from '@actions/core';
import * as github from '@actions/github';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { compareScreenshots } from '@stitchguard/core';
import { writeReports, generateCiSummary } from '@stitchguard/report';
import { captureUrl, closeBrowser } from '@stitchguard/capture';
import type { CompareResult } from '@stitchguard/core';

async function runCompareMode(
  target: string,
  actual: string,
  outputDir: string,
  threshold: number,
): Promise<{ passed: boolean; score: number; reportPath: string }> {
  const result = await compareScreenshots({
    targetPath: path.resolve(target),
    actualPath: path.resolve(actual),
    outputDir,
    threshold,
  });

  await writeReports(result, { agent: 'codex' });

  return {
    passed: result.score >= threshold,
    score: result.score,
    reportPath: result.artifacts.reportPath,
  };
}

async function runCheckMode(
  target: string,
  url: string,
  outputDir: string,
  threshold: number,
  viewport: string,
  wait: number,
): Promise<{ passed: boolean; score: number; reportPath: string }> {
  const [width, height] = viewport.split('x').map(Number);
  const actualPath = path.join(outputDir, 'actual.png');

  try {
    await captureUrl({
      url,
      outputPath: actualPath,
      viewport: { width: width!, height: height! },
      waitMs: wait,
    });

    const result = await compareScreenshots({
      targetPath: path.resolve(target),
      actualPath,
      outputDir,
      threshold,
      viewport: { width: width!, height: height! },
    });

    await writeReports(result, { agent: 'codex' });

    return {
      passed: result.score >= threshold,
      score: result.score,
      reportPath: result.artifacts.reportPath,
    };
  } finally {
    await closeBrowser();
  }
}

async function run(): Promise<void> {
  const target = core.getInput('target', { required: true });
  const url = core.getInput('url');
  const actual = core.getInput('actual');
  const threshold = parseFloat(core.getInput('threshold') || '0.85');
  const viewport = core.getInput('viewport') || '390x844';
  const wait = parseInt(core.getInput('wait') || '1000', 10);
  const outputDir = core.getInput('output-dir') || '.stitchguard';
  const commentOnPr = core.getInput('comment-on-pr') !== 'false';

  let outcome: { passed: boolean; score: number; reportPath: string };

  if (url) {
    outcome = await runCheckMode(target, url, outputDir, threshold, viewport, wait);
  } else if (actual) {
    outcome = await runCompareMode(target, actual, outputDir, threshold);
  } else {
    core.setFailed('Either url or actual input is required.');
    return;
  }

  core.setOutput('score', String(outcome.score));
  core.setOutput('passed', String(outcome.passed));
  core.setOutput('report-path', outcome.reportPath);

  if (commentOnPr && github.context.payload.pull_request) {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      const jsonPath = path.join(outputDir, 'result.json');
      try {
        const content = await readFile(jsonPath, 'utf8');
        const result = JSON.parse(content) as CompareResult;
        const summary = generateCiSummary(result);

        const octokit = github.getOctokit(token);
        await octokit.rest.issues.createComment({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: github.context.payload.pull_request.number,
          body: summary,
        });
      } catch (error) {
        core.warning(
          `Failed to post PR comment: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  if (!outcome.passed) {
    core.setFailed(
      `Visual match ${(outcome.score * 100).toFixed(1)}% is below threshold ${(threshold * 100).toFixed(1)}%`,
    );
  }
}

run().catch((error) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
