/**
 * Generates demo target/actual PNG screenshots for examples and tests.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

const WIDTH = 390;
const HEIGHT = 844;

type Rgba = [number, number, number, number];

function setPixel(data: Buffer, width: number, x: number, y: number, color: Rgba): void {
  const index = (y * width + x) * 4;
  data[index] = color[0];
  data[index + 1] = color[1];
  data[index + 2] = color[2];
  data[index + 3] = color[3];
}

function fillRect(
  data: Buffer,
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Rgba,
): void {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      if (px >= 0 && px < width && py >= 0) {
        setPixel(data, width, px, py, color);
      }
    }
  }
}

function drawMobileUi(data: Buffer, width: number, variant: 'target' | 'actual'): void {
  const bg: Rgba = [248, 246, 250, 255];
  const card: Rgba = [255, 255, 255, 255];
  const accent: Rgba = variant === 'target' ? [207, 152, 175, 255] : [209, 132, 161, 255];
  const text: Rgba = [30, 30, 35, 255];
  const nav: Rgba = [255, 255, 255, 255];

  fillRect(data, width, 0, 0, width, HEIGHT, bg);
  fillRect(data, width, 0, 0, width, 56, [255, 255, 255, 255]);
  fillRect(data, width, 16, 18, 120, 20, text);

  const cardY = variant === 'target' ? 88 : 102;
  const cardRadius = 24;
  fillRect(data, width, 24, cardY, width - 48, 220, card);
  fillRect(data, width, 24, cardY, width - 48, cardRadius, card);
  fillRect(data, width, 24, cardY + 220 - cardRadius, width - 48, cardRadius, card);

  fillRect(data, width, 40, cardY + 24, width - 80, 24, text);
  fillRect(data, width, 40, cardY + 60, width - 120, 14, [120, 120, 130, 255]);

  const buttonY = variant === 'target' ? cardY + 140 : cardY + 154;
  const buttonW = variant === 'target' ? 140 : 132;
  fillRect(data, width, 40, buttonY, buttonW, 44, accent);

  fillRect(data, width, 0, HEIGHT - 72, width, 72, nav);
  fillRect(data, width, 0, HEIGHT - 73, width, 1, [230, 230, 235, 255]);
  fillRect(data, width, 60, HEIGHT - 48, 40, 6, accent);
  fillRect(data, width, 170, HEIGHT - 48, 40, 6, [180, 180, 190, 255]);
  fillRect(data, width, 280, HEIGHT - 48, 40, 6, [180, 180, 190, 255]);
}

function createPng(variant: 'target' | 'actual'): Buffer {
  const png = new PNG({ width: WIDTH, height: HEIGHT });
  drawMobileUi(png.data, WIDTH, variant);
  return PNG.sync.write(png);
}

async function main(): Promise<void> {
  const outputDir = path.resolve('examples/screenshots');
  await mkdir(outputDir, { recursive: true });

  await writeFile(path.join(outputDir, 'target.png'), createPng('target'));
  await writeFile(path.join(outputDir, 'actual.png'), createPng('actual'));

  console.log('Generated examples/screenshots/target.png and actual.png');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
