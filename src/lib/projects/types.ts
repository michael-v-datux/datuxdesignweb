/** Canonical block model for portfolio case studies (Behance-style). */

export type BlockType = 'text' | 'image' | 'media';

export type BlockLayout = '1/1' | '1/2' | '1/3' | '1/4' | 'full';

export interface BlockContent {
  text?: string;
  text_en?: string;
  text_uk?: string;
  url?: string;
  alt?: string;
  mediaType?: 'image' | 'video';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  columns?: Array<{ text?: { en?: string; uk?: string } }>;
}

export interface ProjectBlock {
  id: string;
  project_id: string;
  type: BlockType;
  content: BlockContent;
  position: number;
  layout: BlockLayout;
}

export interface LegacySection {
  layout?: string;
  description?: string;
  images?: Array<{ src?: string; alt?: string; tooltip?: string }>;
}
