import type { IgnoreRegion, LoadedImage, NormalizedPair } from './types.js';

const WHITE = Buffer.from([255, 255, 255, 255]);

function fillPixel(data: Buffer, index: number, color: Buffer): void {
  data[index] = color[0]!;
  data[index + 1] = color[1]!;
  data[index + 2] = color[2]!;
  data[index + 3] = color[3]!;
}

export function normalizeImages(target: LoadedImage, actual: LoadedImage): NormalizedPair {
  const width = Math.max(target.width, actual.width);
  const height = Math.max(target.height, actual.height);

  return {
    target: placeOnCanvas(target, width, height),
    actual: placeOnCanvas(actual, width, height),
    width,
    height,
  };
}

function placeOnCanvas(image: LoadedImage, width: number, height: number): LoadedImage {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    fillPixel(data, i, WHITE);
  }

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const srcIndex = (y * image.width + x) * 4;
      const destIndex = (y * width + x) * 4;
      data[destIndex] = image.data[srcIndex]!;
      data[destIndex + 1] = image.data[srcIndex + 1]!;
      data[destIndex + 2] = image.data[srcIndex + 2]!;
      data[destIndex + 3] = image.data[srcIndex + 3]!;
    }
  }

  return { data, width, height };
}

export function applyIgnoreRegions(
  target: LoadedImage,
  actual: LoadedImage,
  regions: IgnoreRegion[],
): { target: LoadedImage; actual: LoadedImage } {
  const targetData = Buffer.from(target.data);
  const actualData = Buffer.from(actual.data);

  for (const region of regions) {
    const xStart = Math.max(0, region.x);
    const yStart = Math.max(0, region.y);
    const xEnd = Math.min(target.width, region.x + region.width);
    const yEnd = Math.min(target.height, region.y + region.height);

    for (let y = yStart; y < yEnd; y += 1) {
      for (let x = xStart; x < xEnd; x += 1) {
        const index = (y * target.width + x) * 4;
        fillPixel(targetData, index, actualData.subarray(index, index + 4));
      }
    }
  }

  return {
    target: { ...target, data: targetData },
    actual: { ...actual, data: actualData },
  };
}
