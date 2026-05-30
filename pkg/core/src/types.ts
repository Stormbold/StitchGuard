export type IgnoreRegion = {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Viewport = {
  width: number;
  height: number;
};

export type CompareInput = {
  targetPath: string;
  actualPath: string;
  outputDir?: string;
  threshold?: number;
  includeAA?: boolean;
  viewport?: Viewport;
  ignoreRegions?: IgnoreRegion[];
};

export type VisualFindingType = 'layout' | 'color' | 'spacing';

export type VisualFindingSeverity = 'low' | 'medium' | 'high';

export type VisualRegion =
  | 'header'
  | 'upper-content'
  | 'middle-content'
  | 'lower-content'
  | 'bottom';

export type VisualFinding = {
  type: VisualFindingType;
  severity: VisualFindingSeverity;
  region?: VisualRegion | string;
  message: string;
  confidence: number;
};

export type CompareStatus = 'excellent' | 'acceptable' | 'needs_work' | 'fail';

export type CompareArtifacts = {
  diffPath: string;
  heatmapPath: string;
  reportPath: string;
  jsonPath: string;
  agentPromptPath: string;
};

export type CompareResult = {
  version: string;
  target: string;
  actual: string;
  viewport?: Viewport;
  score: number;
  changedPixels: number;
  changedRatio: number;
  totalPixels: number;
  status: CompareStatus;
  dimensions: {
    width: number;
    height: number;
  };
  artifacts: CompareArtifacts;
  findings: VisualFinding[];
  diffBuffer: Buffer;
  heatmapBuffer: Buffer;
};

export type LoadedImage = {
  data: Buffer;
  width: number;
  height: number;
};

export type NormalizedPair = {
  target: LoadedImage;
  actual: LoadedImage;
  width: number;
  height: number;
};

export type PixelDiffResult = {
  diff: Buffer;
  changedPixels: number;
  mismatchMap: Uint8Array;
};

export type RegionDiff = {
  region: VisualRegion;
  changedPixels: number;
  totalPixels: number;
  changedRatio: number;
};

export type DominantColor = {
  hex: string;
  count: number;
  ratio: number;
};

export type ColorComparison = {
  targetColors: DominantColor[];
  actualColors: DominantColor[];
  accentShift?: {
    targetHex: string;
    actualHex: string;
    message: string;
  };
};

export const REGION_LABELS: Record<VisualRegion, string> = {
  header: 'header',
  'upper-content': 'upper-content',
  'middle-content': 'middle-content',
  'lower-content': 'lower-content',
  bottom: 'bottom/navigation',
};

export const REGION_DESCRIPTIONS: Record<VisualRegion, string> = {
  header: 'The header area differs from the target.',
  'upper-content':
    'The largest visual difference appears in the upper-content region. This often indicates mismatched hero spacing, card size, or header alignment.',
  'middle-content': 'The middle content area differs significantly from the target.',
  'lower-content': 'The lower content area differs significantly from the target.',
  bottom:
    'The bottom area has visible spacing differences. This may indicate changed bottom navigation height, padding, or safe-area handling.',
};
