/**
 * Browser-side analysis aligned with @stitchguard/core region + color findings.
 */

const VERTICAL_REGIONS = [
  { region: 'header', startRatio: 0, endRatio: 0.12 },
  { region: 'upper-content', startRatio: 0.12, endRatio: 0.35 },
  { region: 'middle-content', startRatio: 0.35, endRatio: 0.6 },
  { region: 'lower-content', startRatio: 0.6, endRatio: 0.85 },
  { region: 'bottom', startRatio: 0.85, endRatio: 1 },
];

const REGION_DESCRIPTIONS = {
  header: 'The header area differs from the target.',
  'upper-content':
    'The largest visual difference appears in the upper-content region. This often indicates mismatched hero spacing, card size, or header alignment.',
  'middle-content': 'The middle content area differs significantly from the target.',
  'lower-content': 'The lower content area differs significantly from the target.',
  bottom:
    'The bottom area has visible spacing differences. This may indicate changed bottom navigation height, padding, or safe-area handling.',
};

const CONSERVATIVE_RULES = [
  'Do not rewrite the whole app.',
  'Do not change copy/text content unless explicitly needed.',
  'Do not add new features.',
  'Do not change routing.',
  'Do not remove existing functionality.',
  'Focus only on visual fidelity.',
  'Prefer small, targeted changes.',
  'Keep the current stack and component structure.',
];

function isMismatchPixel(data, index) {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  return r > 200 && g < 80 && b < 80;
}

function buildMismatchMap(diffData, width, height) {
  const map = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = y * width + x;
      const i = px * 4;
      if (isMismatchPixel(diffData, i)) {
        map[px] = 1;
      }
    }
  }
  return map;
}

function analyzeRegions(mismatchMap, width, height) {
  return VERTICAL_REGIONS.map(({ region, startRatio, endRatio }) => {
    const yStart = Math.floor(height * startRatio);
    const yEnd = Math.ceil(height * endRatio);
    let changedPixels = 0;
    let totalPixels = 0;

    for (let y = yStart; y < yEnd; y += 1) {
      for (let x = 0; x < width; x += 1) {
        totalPixels += 1;
        if (mismatchMap[y * width + x] === 1) {
          changedPixels += 1;
        }
      }
    }

    return {
      region,
      changedRatio: totalPixels === 0 ? 0 : changedPixels / totalPixels,
    };
  });
}

function regionDiffsToFindings(regionDiffs) {
  const sorted = [...regionDiffs].sort((a, b) => b.changedRatio - a.changedRatio);
  const findings = [];

  for (const region of sorted) {
    if (region.changedRatio < 0.05) continue;
    findings.push({
      type: 'layout',
      region: region.region,
      message: REGION_DESCRIPTIONS[region.region] ?? `The ${region.region} region differs from the target.`,
    });
  }

  return findings.slice(0, 5);
}

function rgbToHex(r, g, b) {
  const toHex = (c) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function isNeutral(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) < 20;
}

function extractDominantColors(image) {
  const counts = new Map();
  const { data, width, height } = image;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;

      const step = 256 / 24;
      const qr = Math.min(255, Math.floor(r / step) * step);
      const qg = Math.min(255, Math.floor(g / step) * step);
      const qb = Math.min(255, Math.floor(b / step) * step);
      const hex = rgbToHex(qr, qg, qb);
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function compareAccentColors(target, actual) {
  const targetAccent = extractDominantColors(target).find((c) => !isNeutral(c.hex));
  const actualAccent = extractDominantColors(actual).find((c) => !isNeutral(c.hex));

  if (!targetAccent || !actualAccent || targetAccent.hex === actualAccent.hex) {
    return null;
  }

  return {
    type: 'color',
    message: `Target dominant accent appears close to \`${targetAccent.hex}\`. Actual dominant accent appears close to \`${actualAccent.hex}\`.`,
  };
}

function getSuggestedFixDirections(findings) {
  const directions = new Set();

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
    if (finding.region === 'header') {
      directions.add('Compare header height, alignment, and top spacing.');
    }
    if (finding.region === 'middle-content') {
      directions.add('Inspect middle section layout and vertical rhythm.');
    }
  }

  directions.add('Run the app again and compare screenshots after changes.');
  return [...directions];
}

export function analyzeComparison({ target, actual, diffData, width, height, score }) {
  const mismatchMap = buildMismatchMap(diffData, width, height);
  const regionDiffs = analyzeRegions(mismatchMap, width, height);
  const layoutFindings = regionDiffsToFindings(regionDiffs);
  const colorFinding = compareAccentColors(target, actual);

  const findings = [...layoutFindings];
  if (colorFinding) findings.push(colorFinding);

  if (findings.length === 0 && score < 0.99) {
    findings.push({
      type: 'layout',
      message: 'Minor pixel differences detected — review spacing, radius, and color tokens.',
    });
  }
  if (findings.length === 0) {
    findings.push({
      type: 'layout',
      message: 'No major differences detected. Screenshots are very close to the target.',
    });
  }

  return { findings, directions: getSuggestedFixDirections(findings) };
}

export function buildReportMd(score, findings) {
  const pct = (score * 100).toFixed(1);
  const status = score >= 0.9 ? 'Excellent' : score >= 0.85 ? 'Acceptable' : 'Needs work';

  return `# StitchGuard Report

## Summary

Visual Match: \`${pct}\`
Status: \`${status}\`

## Main Findings

${findings.map((f, i) => `### ${i + 1}. ${f.type === 'color' ? 'Color' : 'Layout'} finding

${f.message}${f.region ? `\nRegion: ${f.region}` : ''}`).join('\n\n')}

## Generated Repair Prompt

See \`codex-fix-prompt.md\`.
`;
}

export function buildCodexPrompt(score, findings, directions) {
  const pct = (score * 100).toFixed(1);
  const findingLines = findings.map((f, i) => `${i + 1}. ${f.message}`);

  return `# Codex Visual Repair Task

You are working on an existing frontend implementation.

Your task is to make the current UI match the target screenshot more closely.

## Important Rules

${CONSERVATIVE_RULES.map((r) => `- ${r}`).join('\n')}

## StitchGuard Findings

Visual Match: ${pct}%

Main differences:
${findingLines.join('\n')}

## Suggested Fix Direction

${directions.map((d) => `- ${d}`).join('\n')}

## Expected Result

The implementation should visually match the provided target screenshot more closely without introducing unrelated changes.
`;
}
