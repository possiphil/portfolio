import type { Rect, Size } from './camera.ts';

export const levels = ['architecture', 'module', 'function', 'source'] as const;
export type Level = typeof levels[number];
export type Profile = 'wide' | 'compact';
export type Placement = Readonly<Record<Profile, Rect>>;
export type Glyph = 'layers' | 'input' | 'graph' | 'kernel' | 'output' | 'code' | 'detail';

interface SceneBase {
  id: string;
  title: string;
  description: string;
  level: Level;
  glyph: Glyph;
}

export type Region = Readonly<{
  scene: SceneSpec;
  bounds: Placement;
  caption: string;
  featured?: boolean;
}>;

export interface DiagramSpec extends SceneBase {
  kind: 'diagram';
  legend: string;
  regions: readonly Region[];
  links: readonly (readonly [string, string])[];
  preferred: string;
}

export interface SourceLine {
  code: string;
  statement?: DetailSpec;
}

export interface SourceSpec extends SceneBase {
  kind: 'source';
  file: string;
  lines: readonly SourceLine[];
  preferred: string;
}

export interface DetailSpec extends SceneBase {
  kind: 'detail';
  label: string;
  sample?: string;
  note?: string;
}

export type SceneSpec = DiagramSpec | SourceSpec | DetailSpec;

const sizes: Record<SceneSpec['kind'], Record<Profile, Size>> = {
  diagram: { wide: { width: 1000, height: 350 }, compact: { width: 360, height: 440 } },
  source: { wide: { width: 750, height: 320 }, compact: { width: 344, height: 320 } },
  detail: { wide: { width: 640, height: 268 }, compact: { width: 336, height: 310 } },
};

const codeTop = 81;
const lineHeight = 36;

export function sceneSize(spec: SceneSpec, profile: Profile): Size {
  const size = sizes[spec.kind][profile];
  if (spec.kind !== 'source') return size;
  return { width: size.width, height: Math.max(size.height, codeTop + spec.lines.length * lineHeight + 28) };
}

export function sourceRow(index: number, profile: Profile): Rect {
  const compact = profile === 'compact';
  return {
    x: compact ? 8 : 22,
    y: codeTop + index * lineHeight,
    width: sizes.source[profile].width - (compact ? 16 : 44),
    height: lineHeight,
  };
}
