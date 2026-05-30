import sharp from 'sharp';
import { PNG } from 'pngjs';
import type { LoadedImage } from './types.js';

export async function loadImage(filePath: string): Promise<LoadedImage> {
  const metadata = await sharp(filePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read dimensions from image: ${filePath}`);
  }

  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 4) {
    throw new Error(`Expected RGBA image after conversion: ${filePath}`);
  }

  return {
    data,
    width: info.width,
    height: info.height,
  };
}

export function rawToPngBuffer(data: Buffer, width: number, height: number): Buffer {
  const png = new PNG({ width, height });
  data.copy(png.data);
  return PNG.sync.write(png);
}

export function pngBufferToRaw(buffer: Buffer): LoadedImage {
  const png = PNG.sync.read(buffer);
  return {
    data: Buffer.from(png.data),
    width: png.width,
    height: png.height,
  };
}
