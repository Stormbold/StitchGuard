import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, type Browser } from 'playwright';
import type { Viewport } from './devices.js';

export type CaptureUrlOptions = {
  url: string;
  outputPath: string;
  viewport?: Viewport;
  waitMs?: number;
  fullPage?: boolean;
  colorScheme?: 'light' | 'dark';
  deviceScaleFactor?: number;
};

let sharedBrowser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch({ headless: true });
  }
  return sharedBrowser;
}

export async function captureUrl(options: CaptureUrlOptions): Promise<string> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: options.viewport ?? { width: 390, height: 844 },
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
    colorScheme: options.colorScheme ?? 'light',
  });

  const page = await context.newPage();

  try {
    await page.goto(options.url, { waitUntil: 'networkidle' });

    if (options.waitMs && options.waitMs > 0) {
      await page.waitForTimeout(options.waitMs);
    }

    await mkdir(path.dirname(options.outputPath), { recursive: true });

    await page.screenshot({
      path: options.outputPath,
      fullPage: options.fullPage ?? false,
    });

    return options.outputPath;
  } finally {
    await context.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}
