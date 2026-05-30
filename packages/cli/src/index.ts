#!/usr/bin/env node
import { Command } from 'commander';
import { runCompare } from './commands/compare.js';
import { runCheck } from './commands/check.js';
import { runInit } from './commands/init.js';
import { runReport } from './commands/report.js';
import { runAgentPrompt } from './commands/agent-prompt.js';

const program = new Command();

program
  .name('stitchguard')
  .description('Compare target design screenshots with implemented UI and generate agent repair prompts')
  .version('0.1.0');

program
  .command('compare')
  .description('Compare a target design screenshot with an actual implementation screenshot')
  .argument('<target>', 'Path to target design screenshot')
  .argument('<actual>', 'Path to actual implementation screenshot')
  .option('-o, --output-dir <dir>', 'Output directory for artifacts', '.stitchguard')
  .option('-t, --threshold <number>', 'Pass threshold (0-1)', parseFloat)
  .option('--include-aa', 'Include anti-aliasing in pixel comparison')
  .option('--agent <agent>', 'Generate agent-specific prompt (codex, cursor, claude)')
  .option('--mode <mode>', 'Prompt mode (conservative, strict, refactor-safe)')
  .option('--tailwind', 'Include Tailwind adjustment hints')
  .action(async (target, actual, options) => {
    try {
      const { passed } = await runCompare(target, actual, {
        outputDir: options.outputDir,
        threshold: options.threshold,
        includeAA: options.includeAa,
        agent: options.agent,
        mode: options.mode,
        tailwind: options.tailwind,
      });
      process.exitCode = passed ? 0 : 1;
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program
  .command('check')
  .description('Capture a URL screenshot and compare it with a target design')
  .requiredOption('--target <path>', 'Path to target design screenshot')
  .requiredOption('--url <url>', 'URL to capture')
  .option('-o, --output-dir <dir>', 'Output directory for artifacts')
  .option('-t, --threshold <number>', 'Pass threshold (0-1)', parseFloat)
  .option('--viewport <size>', 'Viewport size WxH (e.g. 390x844)')
  .option('--device <preset>', 'Device preset (iphone-14, ipad, desktop)')
  .option('--wait <ms>', 'Wait before screenshot in ms', (value) => parseInt(value, 10))
  .option('--full-page', 'Capture full page screenshot')
  .option('--include-aa', 'Include anti-aliasing in pixel comparison')
  .option('--agent <agent>', 'Generate agent-specific prompt (codex, cursor, claude)')
  .option('--mode <mode>', 'Prompt mode (conservative, strict, refactor-safe)')
  .option('--tailwind', 'Include Tailwind adjustment hints')
  .option('--color-scheme <scheme>', 'Color scheme (light, dark)')
  .action(async (options) => {
    try {
      const { passed } = await runCheck({
        target: options.target,
        url: options.url,
        outputDir: options.outputDir,
        threshold: options.threshold,
        viewport: options.viewport,
        device: options.device,
        wait: options.wait,
        fullPage: options.fullPage,
        includeAA: options.includeAa,
        agent: options.agent,
        mode: options.mode,
        tailwind: options.tailwind,
        colorScheme: options.colorScheme,
      });
      process.exitCode = passed ? 0 : 1;
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program
  .command('init')
  .description('Create a stitchguard.config.ts file')
  .option('--force', 'Overwrite existing config file')
  .action(async (options) => {
    try {
      await runInit(options.force);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program
  .command('report')
  .description('Print a markdown report from result.json')
  .argument('[report]', 'Path to result.json', '.stitchguard/result.json')
  .action(async (reportPath) => {
    try {
      await runReport(reportPath);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program
  .command('agent-prompt')
  .description('Generate an agent repair prompt from result.json')
  .option('--report <path>', 'Path to result.json', '.stitchguard/result.json')
  .option('--agent <agent>', 'Agent target (codex, cursor, claude)')
  .option('--mode <mode>', 'Prompt mode (conservative, strict, refactor-safe)')
  .option('-o, --output <path>', 'Output path for prompt file')
  .action(async (options) => {
    try {
      await runAgentPrompt(options.report, {
        agent: options.agent,
        mode: options.mode,
        output: options.output,
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  });

program.parse();
