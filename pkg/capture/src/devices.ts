export type Viewport = {
  width: number;
  height: number;
};

export type DevicePreset = {
  name: string;
  viewport: Viewport;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  colorScheme?: 'light' | 'dark';
};

export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  'iphone-14': {
    name: 'iPhone 14',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
  },
  ipad: {
    name: 'iPad',
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
    isMobile: true,
  },
  desktop: {
    name: 'Desktop',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    isMobile: false,
  },
};

export function parseViewport(value: string): Viewport {
  const match = value.match(/^(\d+)x(\d+)$/i);
  if (!match) {
    throw new Error(`Invalid viewport format: ${value}. Expected WxH (e.g. 390x844).`);
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

export function getDevicePreset(name: string): DevicePreset {
  const preset = DEVICE_PRESETS[name.toLowerCase()];
  if (!preset) {
    const available = Object.keys(DEVICE_PRESETS).join(', ');
    throw new Error(`Unknown device preset: ${name}. Available: ${available}`);
  }
  return preset;
}
