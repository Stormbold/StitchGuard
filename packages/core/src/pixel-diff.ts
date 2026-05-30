import pixelmatch from 'pixelmatch';
import type { LoadedImage, PixelDiffResult } from './types.js';

export type PixelDiffOptions = {
  includeAA?: boolean;
  threshold?: number;
  diffColor?: [number, number, number];
};

export function computePixelDiff(
  target: LoadedImage,
  actual: LoadedImage,
  options: PixelDiffOptions = {},
): PixelDiffResult {
  const { includeAA = false, threshold = 0.1, diffColor = [255, 0, 255] } = options;

  const diff = Buffer.alloc(target.width * target.height * 4);
  const mismatchMap = new Uint8Array(target.width * target.height);

  const changedPixels = pixelmatch(
    target.data,
    actual.data,
    diff,
    target.width,
    target.height,
    {
      includeAA,
      threshold,
      diffColor,
    },
  );

  for (let i = 0; i < mismatchMap.length; i += 1) {
    const alpha = diff[i * 4 + 3] ?? 0;
    mismatchMap[i] = alpha > 0 ? 1 : 0;
  }

  return { diff, changedPixels, mismatchMap };
}

export function createHeatmap(
  mismatchMap: Uint8Array,
  width: number,
  height: number,
): Buffer {
  const heatmap = Buffer.alloc(width * height * 4);

  for (let i = 0; i < mismatchMap.length; i += 1) {
    const offset = i * 4;
    if (mismatchMap[i] === 1) {
      heatmap[offset] = 255;
      heatmap[offset + 1] = 60;
      heatmap[offset + 2] = 60;
      heatmap[offset + 3] = 200;
    } else {
      heatmap[offset + 3] = 0;
    }
  }

  return heatmap;
}
