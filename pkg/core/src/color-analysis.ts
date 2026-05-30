import type { ColorComparison, DominantColor, LoadedImage, VisualFinding } from './types.js';

const COLOR_BUCKETS = 24;

function quantize(value: number): number {
  const step = 256 / COLOR_BUCKETS;
  return Math.min(255, Math.floor(value / step) * step);
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function colorDistance(a: DominantColor, b: DominantColor): number {
  const ar = parseInt(a.hex.slice(1, 3), 16);
  const ag = parseInt(a.hex.slice(3, 5), 16);
  const ab = parseInt(a.hex.slice(5, 7), 16);
  const br = parseInt(b.hex.slice(1, 3), 16);
  const bg = parseInt(b.hex.slice(3, 5), 16);
  const bb = parseInt(b.hex.slice(5, 7), 16);
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}

export function extractDominantColors(image: LoadedImage, topN = 5): DominantColor[] {
  const counts = new Map<string, number>();
  let sampledPixels = 0;

  for (let i = 0; i < image.data.length; i += 16) {
    const r = image.data[i]!;
    const g = image.data[i + 1]!;
    const b = image.data[i + 2]!;
    const a = image.data[i + 3]!;

    if (a < 128) continue;
    if (r > 240 && g > 240 && b > 240) continue;

    const qr = quantize(r);
    const qg = quantize(g);
    const qb = quantize(b);
    const hex = rgbToHex(qr, qg, qb);
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
    sampledPixels += 1;
  }

  const total = sampledPixels || 1;

  return [...counts.entries()]
    .map(([hex, count]) => ({ hex, count, ratio: count / total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function compareColors(target: LoadedImage, actual: LoadedImage): ColorComparison {
  const targetColors = extractDominantColors(target);
  const actualColors = extractDominantColors(actual);

  const targetAccent = targetColors.find((color) => !isNeutral(color.hex));
  const actualAccent = actualColors.find((color) => !isNeutral(color.hex));

  let accentShift: ColorComparison['accentShift'];

  if (targetAccent && actualAccent && targetAccent.hex !== actualAccent.hex) {
    const distance = colorDistance(targetAccent, actualAccent);
    if (distance > 20) {
      accentShift = {
        targetHex: targetAccent.hex,
        actualHex: actualAccent.hex,
        message: `Target dominant accent appears close to \`${targetAccent.hex}\`. Actual dominant accent appears close to \`${actualAccent.hex}\`.`,
      };
    }
  }

  return { targetColors, actualColors, accentShift };
}

function isNeutral(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 20;
}

export function colorComparisonToFindings(comparison: ColorComparison): VisualFinding[] {
  if (!comparison.accentShift) return [];

  return [
    {
      type: 'color',
      severity: 'medium',
      message: comparison.accentShift.message,
      confidence: 0.74,
    },
  ];
}
