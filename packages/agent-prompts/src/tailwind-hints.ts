import type { VisualFinding } from '@stitchguard/core';

export type TailwindHintInput = {
  findings: VisualFinding[];
  targetAccent?: string;
  actualAccent?: string;
};

const RADIUS_MAP: Array<{ px: number; className: string }> = [
  { px: 4, className: 'rounded-sm' },
  { px: 6, className: 'rounded-md' },
  { px: 8, className: 'rounded-lg' },
  { px: 12, className: 'rounded-xl' },
  { px: 16, className: 'rounded-2xl' },
  { px: 24, className: 'rounded-3xl' },
];

const PADDING_MAP: Array<{ px: number; className: string }> = [
  { px: 8, className: 'px-2' },
  { px: 12, className: 'px-3' },
  { px: 16, className: 'px-4' },
  { px: 20, className: 'px-5' },
  { px: 24, className: 'px-6' },
  { px: 32, className: 'px-8' },
];

function nearestRadiusClass(px: number): string {
  const nearest = RADIUS_MAP.reduce((best, current) =>
    Math.abs(current.px - px) < Math.abs(best.px - px) ? current : best,
  );
  return nearest.className;
}

function nearestPaddingClass(px: number): string {
  const nearest = PADDING_MAP.reduce((best, current) =>
    Math.abs(current.px - px) < Math.abs(best.px - px) ? current : best,
  );
  return nearest.className;
}

export function generateTailwindHints(input: TailwindHintInput): string[] {
  const hints: string[] = [];

  for (const finding of input.findings) {
    if (finding.region === 'upper-content') {
      hints.push('Compare card padding — consider increasing `px-4` to `px-6`.');
      hints.push(
        `Compare border radius — target may be closer to \`${nearestRadiusClass(24)}\` than \`${nearestRadiusClass(16)}\`.`,
      );
    }
    if (finding.region === 'bottom') {
      hints.push('Review bottom navigation padding and safe-area classes such as `pb-safe`.');
    }
  }

  if (input.targetAccent && input.actualAccent && input.targetAccent !== input.actualAccent) {
    hints.push(
      `Replace accent color toward \`bg-[${input.targetAccent}]\` instead of \`bg-[${input.actualAccent}]\`.`,
    );
  }

  if (findingMentionsTypography(input.findings)) {
    hints.push('Compare typography scale — `text-lg` vs `text-xl` may need adjustment.');
  }

  return [...new Set(hints)];
}

function findingMentionsTypography(findings: VisualFinding[]): boolean {
  return findings.some(
    (finding) =>
      finding.message.toLowerCase().includes('upper-content') ||
      finding.message.toLowerCase().includes('middle-content'),
  );
}

export function detectStackFromPackageJson(content: string): {
  hasTailwind: boolean;
  hasShadcn: boolean;
} {
  const pkg = JSON.parse(content) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const hasTailwind = Boolean(deps.tailwindcss || deps['@tailwindcss/postcss']);
  const hasShadcn = Boolean(
    deps['@radix-ui/react-slot'] ||
      deps['class-variance-authority'] ||
      deps['tailwindcss-animate'],
  );

  return { hasTailwind, hasShadcn };
}

export function generateShadcnHints(findings: VisualFinding[]): string[] {
  const hints: string[] = [];

  if (findings.some((f) => f.region === 'upper-content')) {
    hints.push('Check Card component radius and padding defaults in shadcn/ui.');
    hints.push('Verify Button variant/size props match the target design.');
  }

  if (findings.some((f) => f.type === 'color')) {
    hints.push('Review CSS variables in globals.css for primary/accent token alignment.');
  }

  return hints;
}

export { nearestPaddingClass, nearestRadiusClass };
