import type { BlockContent, MediaBorderRadius, MediaObjectFit, MediaShadow } from './types';

const RADIUS_VALUES: MediaBorderRadius[] = [
  'none',
  'sm',
  'md',
  'lg',
  'xl',
  'full',
  'custom',
];

const FIT_VALUES: MediaObjectFit[] = ['cover', 'contain'];
const SHADOW_VALUES: MediaShadow[] = ['none', 'sm', 'md', 'lg'];

function safeCustomRadius(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  if (/^\d+(\.\d+)?(px|rem|%)$/.test(v)) return v;
  if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
  return null;
}

export function mediaStyleClasses(content: BlockContent): string[] {
  const classes: string[] = [];
  const radius = RADIUS_VALUES.includes(content.borderRadius as MediaBorderRadius)
    ? content.borderRadius
    : 'md';
  if (radius && radius !== 'md' && radius !== 'custom') {
    classes.push(`project-block__media--radius-${radius}`);
  }
  const fit = FIT_VALUES.includes(content.objectFit as MediaObjectFit)
    ? content.objectFit
    : 'cover';
  if (fit && fit !== 'cover') {
    classes.push(`project-block__media--fit-${fit}`);
  }
  const shadow = SHADOW_VALUES.includes(content.shadow as MediaShadow)
    ? content.shadow
    : 'md';
  if (shadow && shadow !== 'md') {
    classes.push(`project-block__media--shadow-${shadow}`);
  }
  return classes;
}

export function mediaStyleInline(content: BlockContent): string {
  if (content.borderRadius === 'custom') {
    const custom = safeCustomRadius(content.borderRadiusCustom);
    if (custom) return `border-radius: ${custom};`;
  }
  return '';
}
