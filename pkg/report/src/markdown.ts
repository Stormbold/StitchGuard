import type { CompareResult } from '@stitchguard/core';
import { formatPercent, formatScore, riskLevelFromScore } from '@stitchguard/core';

function statusLabel(status: CompareResult['status']): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'acceptable':
      return 'Acceptable';
    case 'needs_work':
      return 'Needs Work';
    default:
      return 'Fail';
  }
}

export function generateMarkdownReport(result: CompareResult): string {
  const viewport = result.viewport
    ? `${result.viewport.width}x${result.viewport.height}`
    : `${result.dimensions.width}x${result.dimensions.height}`;

  const findingsSection =
    result.findings.length > 0
      ? result.findings
          .map((finding, index) => {
            return `### ${index + 1}. ${capitalize(finding.type)} finding

${finding.message}

Severity: ${capitalize(finding.severity)}  
Confidence: ${finding.confidence.toFixed(2)}${finding.region ? `\nRegion: ${finding.region}` : ''}`;
          })
          .join('\n\n')
      : 'No significant visual differences detected.';

  return `# StitchGuard Report

## Summary

Target: \`${result.target}\`  
Actual: \`${result.actual}\`  
Viewport: \`${viewport}\`  
Visual Match: \`${formatScore(result.score)}\`  
Changed Pixels: \`${formatPercent(result.changedRatio)}\`  
Risk Level: \`${riskLevelFromScore(result.score)}\`  
Status: \`${statusLabel(result.status)}\`

## Main Findings

${findingsSection}

## Generated Repair Prompt

See \`codex-fix-prompt.md\`.

## Artifacts

- \`diff.png\`
- \`heatmap.png\`
- \`result.json\`
- \`codex-fix-prompt.md\`
`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function generateCiSummary(result: CompareResult): string {
  const mainDifferences = result.findings.slice(0, 5).map((finding) => `- ${finding.message}`);

  return `## StitchGuard Visual Report

Visual Match: ${formatScore(result.score)}

Main differences:
${mainDifferences.length > 0 ? mainDifferences.join('\n') : '- No major differences detected.'}

Generated fix prompt attached.`;
}
