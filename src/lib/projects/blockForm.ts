import type { BlockContent, BlockType, ProjectBlock } from './types';

export function contentFromForm(
  type: BlockType,
  fields: {
    text_en?: string;
    text_uk?: string;
    text?: string;
    url?: string;
    alt?: string;
  }
): BlockContent {
  if (type === 'text') {
    const text_en = (fields.text_en ?? fields.text ?? '').trim();
    const text_uk = (fields.text_uk ?? '').trim();
    return { text_en, text_uk, text: text_en || text_uk };
  }

  if (type === 'image') {
    return {
      url: (fields.url ?? '').trim(),
      alt: (fields.alt ?? '').trim(),
      mediaType: 'image',
    };
  }

  return {
    url: (fields.url ?? '').trim(),
    mediaType: 'video',
    autoplay: true,
    loop: true,
    muted: true,
  };
}

export function blockToFormValues(block: ProjectBlock) {
  const { type, content, layout } = block;
  return {
    type,
    layout,
    text_en: content.text_en ?? content.text ?? '',
    text_uk: content.text_uk ?? '',
    url: content.url ?? '',
    alt: content.alt ?? '',
  };
}
