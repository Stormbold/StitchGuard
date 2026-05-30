/**
 * Programmatic mock UI screenshots for examples and bad-ui-zoo fixtures.
 */
import { PNG } from 'pngjs';

export const MOBILE_WIDTH = 390;
export const MOBILE_HEIGHT = 844;

type Rgba = [number, number, number, number];

export function setPixel(data: Buffer, width: number, x: number, y: number, color: Rgba): void {
  const index = (y * width + x) * 4;
  data[index] = color[0]!;
  data[index + 1] = color[1]!;
  data[index + 2] = color[2]!;
  data[index + 3] = color[3]!;
}

export function fillRect(
  data: Buffer,
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Rgba,
  height = MOBILE_HEIGHT,
): void {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      if (px >= 0 && px < width && py >= 0 && py < height) {
        setPixel(data, width, px, py, color);
      }
    }
  }
}

export function createPngBuffer(
  width: number,
  height: number,
  draw: (data: Buffer, width: number) => void,
): Buffer {
  const png = new PNG({ width, height });
  draw(png.data, width);
  return PNG.sync.write(png);
}

export function drawGoogleStitchMobile(data: Buffer, width: number, variant: 'target' | 'actual'): void {
  const bg: Rgba = [248, 246, 250, 255];
  const card: Rgba = [255, 255, 255, 255];
  const accent: Rgba = variant === 'target' ? [207, 152, 175, 255] : [209, 132, 161, 255];
  const text: Rgba = [30, 30, 35, 255];

  fillRect(data, width, 0, 0, width, MOBILE_HEIGHT, bg);
  fillRect(data, width, 0, 0, width, 56, [255, 255, 255, 255]);
  fillRect(data, width, 16, 18, 120, 20, text);

  const cardY = variant === 'target' ? 88 : 102;
  fillRect(data, width, 24, cardY, width - 48, 220, card);
  fillRect(data, width, 40, cardY + 24, width - 80, 24, text);
  fillRect(data, width, 40, cardY + 60, width - 120, 14, [120, 120, 130, 255]);

  const buttonY = variant === 'target' ? cardY + 140 : cardY + 154;
  const buttonW = variant === 'target' ? 140 : 132;
  fillRect(data, width, 40, buttonY, buttonW, 44, accent);

  fillRect(data, width, 0, MOBILE_HEIGHT - 72, width, 72, [255, 255, 255, 255]);
  fillRect(data, width, 60, MOBILE_HEIGHT - 48, 40, 6, accent);
}

export function drawShadcnDashboard(data: Buffer, width: number, variant: 'target' | 'actual'): void {
  fillRect(data, width, 0, 0, width, MOBILE_HEIGHT, [250, 250, 250, 255]);
  fillRect(data, width, 16, 16, width - 32, 48, [255, 255, 255, 255]);
  const radius = variant === 'target' ? 24 : 12;
  fillRect(data, width, 16, 80, width - 32, 180, [255, 255, 255, 255]);
  fillRect(data, width, 16, 80, width - 32, radius, [255, 255, 255, 255]);
  fillRect(data, width, 32, 100, 120, 16, [30, 30, 35, 255]);
  fillRect(data, width, 32, 200, variant === 'target' ? 140 : 100, 40, [207, 152, 175, 255]);
}

export function drawLandingPage(data: Buffer, width: number, variant: 'target' | 'actual'): void {
  fillRect(data, width, 0, 0, width, MOBILE_HEIGHT, [255, 255, 255, 255]);
  const heroY = variant === 'target' ? 120 : 160;
  fillRect(data, width, 24, heroY, width - 48, 32, [20, 20, 30, 255]);
  fillRect(data, width, 24, heroY + 48, width - 80, 16, [100, 100, 110, 255]);
  fillRect(data, width, 24, heroY + 100, 160, 48, [207, 152, 175, 255]);
}

export function drawBrokenTailwindCard(data: Buffer, width: number, variant: 'target' | 'actual'): void {
  fillRect(data, width, 0, 0, width, MOBILE_HEIGHT, [248, 246, 250, 255]);
  const pad = variant === 'target' ? 32 : 16;
  const cardW = width - pad * 2;
  fillRect(data, width, pad, 100, cardW, 200, [255, 255, 255, 255]);
  fillRect(data, width, pad + 16, 120, cardW - 32, 20, [30, 30, 35, 255]);
  fillRect(data, width, pad + 16, 180, variant === 'target' ? 120 : 80, 36, [209, 132, 161, 255]);
}

export type MockVariant =
  | 'google-stitch-to-codex'
  | 'shadcn-dashboard'
  | 'landing-page'
  | 'broken-tailwind-card';

const DRAWERS: Record<
  MockVariant,
  (data: Buffer, width: number, variant: 'target' | 'actual') => void
> = {
  'google-stitch-to-codex': drawGoogleStitchMobile,
  'shadcn-dashboard': drawShadcnDashboard,
  'landing-page': drawLandingPage,
  'broken-tailwind-card': drawBrokenTailwindCard,
};

export function renderMockPair(variant: MockVariant): { target: Buffer; actual: Buffer } {
  const draw = DRAWERS[variant];
  return {
    target: createPngBuffer(MOBILE_WIDTH, MOBILE_HEIGHT, (d, w) => draw(d, w, 'target')),
    actual: createPngBuffer(MOBILE_WIDTH, MOBILE_HEIGHT, (d, w) => draw(d, w, 'actual')),
  };
}

export type ZooCase =
  | 'wrong-spacing'
  | 'wrong-radius'
  | 'wrong-font-size'
  | 'wrong-color-token'
  | 'broken-mobile-safe-area'
  | 'shifted-bottom-nav'
  | 'oversized-card'
  | 'missing-shadow'
  | 'wrong-button-height'
  | 'hero-offset';

export function renderZooPair(caseId: ZooCase): { target: Buffer; actual: Buffer } {
  switch (caseId) {
    case 'wrong-spacing':
      return {
        target: createPngBuffer(MOBILE_WIDTH, MOBILE_HEIGHT, (d, w) => {
          drawGoogleStitchMobile(d, w, 'target');
        }),
        actual: createPngBuffer(MOBILE_WIDTH, MOBILE_HEIGHT, (d, w) => {
          drawGoogleStitchMobile(d, w, 'actual');
        }),
      };
    case 'wrong-radius':
      return renderMockPair('shadcn-dashboard');
    case 'wrong-color-token':
      return renderMockPair('google-stitch-to-codex');
    case 'hero-offset':
      return renderMockPair('landing-page');
    case 'wrong-button-height':
    case 'broken-mobile-safe-area':
    case 'shifted-bottom-nav':
    case 'oversized-card':
    case 'missing-shadow':
    case 'wrong-font-size':
      return renderMockPair('broken-tailwind-card');
    default:
      return renderMockPair('google-stitch-to-codex');
  }
}
