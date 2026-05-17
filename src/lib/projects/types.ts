/** Canonical block model for portfolio case studies (Behance-style). */

export type BlockType = 'text' | 'image' | 'media';

export type BlockLayout = '1/1' | '1/2' | '1/3' | '1/4' | 'full';

export type BlockAlign = 'left' | 'center' | 'right';

export type BlockTextAlign = 'left' | 'center' | 'right' | 'justify';

export type MediaBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'custom';
export type MediaObjectFit = 'cover' | 'contain';
export type MediaShadow = 'none' | 'sm' | 'md' | 'lg';

export interface BlockContent {
  align?: BlockAlign;
  textAlign?: BlockTextAlign;
  text?: string;
  text_en?: string;
  text_uk?: string;
  url?: string;
  alt?: string;
  mediaType?: 'image' | 'video';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  borderRadius?: MediaBorderRadius;
  borderRadiusCustom?: string;
  objectFit?: MediaObjectFit;
  shadow?: MediaShadow;
  columns?: Array<{ text?: { en?: string; uk?: string } }>;
}

export interface ProjectBlock {
  id: string;
  project_id: string;
  type: BlockType;
  content: BlockContent;
  position: number;
  layout: BlockLayout;
  column_id?: string | null;
}

export interface ProjectColumn {
  id: string;
  row_id: string;
  position: number;
  span: BlockLayout;
  blocks: ProjectBlock[];
}

export interface ProjectRow {
  id: string;
  project_id: string;
  position: number;
  full_width?: boolean;
  columns: ProjectColumn[];
}

export interface ProjectLayout {
  projectId: string;
  rows: ProjectRow[];
}

export interface LegacySection {
  layout?: string;
  description?: string;
  images?: Array<{ src?: string; alt?: string; tooltip?: string }>;
}
