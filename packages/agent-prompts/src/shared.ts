import type { CompareResult, VisualFinding } from '@stitchguard/core';

export type AgentTarget = 'codex' | 'cursor' | 'claude';

export type PromptMode = 'conservative' | 'strict' | 'refactor-safe';

export type PromptStack = 'generic' | 'nextjs-tailwind' | 'shadcn';

export type GeneratePromptOptions = {
  agent?: AgentTarget;
  mode?: PromptMode;
  stack?: PromptStack;
  tailwindHints?: string[];
};

export const CONSERVATIVE_RULES = [
  'Do not rewrite the whole app.',
  'Do not change copy/text content unless explicitly needed.',
  'Do not add new features.',
  'Do not change routing.',
  'Do not remove existing functionality.',
  'Focus only on visual fidelity.',
  'Prefer small, targeted changes.',
  'Keep the current stack and component structure.',
];

export const STRICT_RULES = [
  ...CONSERVATIVE_RULES,
  'Match spacing, typography, and colors as closely as possible to the target screenshot.',
  'Do not introduce new components unless absolutely required for visual alignment.',
];

export const REFACTOR_SAFE_RULES = [
  ...CONSERVATIVE_RULES,
  'Limit edits to style-related files and inline layout adjustments.',
  'Avoid moving components between files or renaming exports.',
];

export function getRulesForMode(mode: PromptMode): string[] {
  switch (mode) {
    case 'strict':
      return STRICT_RULES;
    case 'refactor-safe':
      return REFACTOR_SAFE_RULES;
    default:
      return CONSERVATIVE_RULES;
  }
}

export function formatFindingsList(findings: VisualFinding[]): string[] {
  return findings.map((finding, index) => `${index + 1}. ${finding.message}`);
}

export function getSuggestedFixDirections(findings: VisualFinding[]): string[] {
  const directions = new Set<string>();

  for (const finding of findings) {
    if (finding.type === 'layout' && finding.region === 'upper-content') {
      directions.add('Check hero/header spacing first.');
      directions.add('Compare card padding and border radius.');
    }
    if (finding.type === 'color') {
      directions.add('Align primary color tokens with the target.');
    }
    if (finding.region === 'bottom') {
      directions.add('Review bottom safe-area and navigation padding.');
    }
  }

  directions.add('Run the app again and compare screenshots after changes.');

  return [...directions];
}

export function buildPromptHeader(agent: AgentTarget): string {
  switch (agent) {
    case 'cursor':
      return '# Cursor Visual Repair Task';
    case 'claude':
      return '# Claude Code Visual Repair Task';
    default:
      return '# Codex Visual Repair Task';
  }
}

export function buildPromptIntro(agent: AgentTarget): string {
  switch (agent) {
    case 'cursor':
      return 'Use the StitchGuard report to make a minimal visual correction pass on the existing frontend implementation.';
    case 'claude':
      return 'Inspect the relevant UI files and apply a conservative visual-fidelity fix based on the StitchGuard report.';
    default:
      return 'You are working on an existing frontend implementation.\n\nYour task is to make the current UI match the target screenshot more closely.';
  }
}

export function buildAgentSpecificGuidance(agent: AgentTarget): string[] {
  switch (agent) {
    case 'cursor':
      return [
        'Do not refactor unrelated files.',
        'Do not redesign the UI.',
        'Only adjust styles/layout needed to reduce the visual differences reported by StitchGuard.',
        'After editing, run the app and generate a new screenshot for comparison.',
      ];
    case 'claude':
      return [
        'Prioritize layout spacing, color tokens, typography scale, border radius, and bottom navigation/safe-area spacing.',
        'Avoid broad rewrites.',
      ];
    default:
      return [];
  }
}

export function formatScorePercent(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function generateAgentPrompt(
  result: CompareResult,
  options: GeneratePromptOptions = {},
): string {
  const agent = options.agent ?? 'codex';
  const mode = options.mode ?? 'conservative';
  const rules = getRulesForMode(mode);
  const findings = formatFindingsList(result.findings);
  const directions = getSuggestedFixDirections(result.findings);
  const header = buildPromptHeader(agent);
  const intro = buildPromptIntro(agent);
  const agentGuidance = buildAgentSpecificGuidance(agent);

  const sections = [
    header,
    '',
    intro,
    '',
    '## Important Rules',
    '',
    ...rules.map((rule) => `- ${rule}`),
  ];

  if (agentGuidance.length > 0) {
    sections.push('', '## Agent Guidance', '', ...agentGuidance.map((line) => `- ${line}`));
  }

  sections.push(
    '',
    '## StitchGuard Findings',
    '',
    `Visual Match: ${formatScorePercent(result.score)}`,
    '',
    'Main differences:',
    ...(findings.length > 0 ? findings.map((item) => `${item}`) : ['- No major differences detected.']),
    '',
    '## Suggested Fix Direction',
    '',
    ...directions.map((direction) => `- ${direction}`),
  );

  if (options.tailwindHints?.length) {
    sections.push(
      '',
      '## Likely Tailwind adjustments',
      '',
      ...options.tailwindHints.map((hint) => `- ${hint}`),
    );
  }

  sections.push(
    '',
    '## Expected Result',
    '',
    'The implementation should visually match the provided target screenshot more closely without introducing unrelated changes.',
  );

  return sections.join('\n');
}

export function getAgentPromptFilename(agent: AgentTarget): string {
  switch (agent) {
    case 'cursor':
      return 'cursor-fix-prompt.md';
    case 'claude':
      return 'claude-fix-prompt.md';
    default:
      return 'codex-fix-prompt.md';
  }
}
