import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { compareScreenshots } from '@stitchguard/core';
import { writeReports, generatePrComment } from '@stitchguard/report';
import type { CompareResult } from '@stitchguard/core';

async function captureUrlDynamic(
  options: Parameters<typeof import('@stitchguard/capture')['captureUrl']>[0],
): Promise<string> {
  const { captureUrl } = await import('@stitchguard/capture');
  return captureUrl(options);
}

async function closeBrowserDynamic(): Promise<void> {
  const { closeBrowser } = await import('@stitchguard/capture');
  await closeBrowser();
}

async function runCompareMode(
  target: string,
  actual: string,
  outputDir: string,
  threshold: number,
): Promise<CompareResult & { passed: boolean }> {
  const result = await compareScreenshots({
    targetPath: path.resolve(target),
    actualPath: path.resolve(actual),
    outputDir,
    threshold,
  });

  await writeReports(result, { agent: 'codex' });

  return {
    ...result,
    passed: result.score >= threshold,
  };
}

async function runCheckMode(
  target: string,
  url: string,
  outputDir: string,
  threshold: number,
  viewport: string,
  wait: number,
): Promise<CompareResult & { passed: boolean }> {
  const [width, height] = viewport.split('x').map(Number);
  const actualPath = path.join(outputDir, 'actual.png');

  try {
    await captureUrlDynamic({
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
      ...result,
      passed: result.score >= threshold,
    };
  } finally {
    await closeBrowserDynamic();
  }
}

function workflowRunUrl(): string | undefined {
  const { serverUrl, repo, runId } = github.context;
  if (!runId) return undefined;
  return `${serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${runId}`;
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
  const failOnThreshold = core.getInput('fail-on-threshold') !== 'false';
  const attachPrompt = core.getInput('attach-prompt') === 'true';

  let outcome: CompareResult & { passed: boolean };

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
  core.setOutput('report-path', outcome.artifacts.reportPath);
  core.setOutput('output-dir', outputDir);

  const runUrl = workflowRunUrl();
  if (runUrl) {
    core.setOutput('artifact-url', runUrl);
  }

  if (commentOnPr && github.context.payload.pull_request) {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      try {
        let promptContent: string | undefined;
        if (attachPrompt) {
          try {
            promptContent = await readFile(
              path.join(outputDir, 'codex-fix-prompt.md'),
              'utf8',
            );
          } catch {
            // optional
          }
        }

        const summary = generatePrComment(outcome, {
          artifactUrl: runUrl,
          attachPrompt,
          promptContent,
        });

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

  if (failOnThreshold && !outcome.passed) {
    core.setFailed(
      `Visual match ${(outcome.score * 100).toFixed(1)}% is below threshold ${(threshold * 100).toFixed(1)}%`,
    );
  }
}

run().catch((error) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
