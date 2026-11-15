/** Shared presentation vocabulary for public pages, previews and section templates. */
export const SECTION_VARIANTS = ['plain', 'editorial', 'showcase', 'statement', 'gallery', 'contrast'];
export const SECTION_ACCENTS = ['violet', 'mint', 'rose', 'amber'];
export function normalizePresentation(value) {
  const p = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    variant: SECTION_VARIANTS.includes(p.variant) ? p.variant : 'plain',
    accent: SECTION_ACCENTS.includes(p.accent) ? p.accent : 'violet',
    label_en: typeof p.label_en === 'string' ? p.label_en.trim().slice(0, 100) : '',
    label_uk: typeof p.label_uk === 'string' ? p.label_uk.trim().slice(0, 100) : '',
  };
}
export function sectionClasses(row) {
  const p = normalizePresentation(row.presentation);
  return ['case-section', `case-section--${p.variant}`, `case-section--accent-${p.accent}`,
    row.columns?.length === 2 ? 'case-section--two-columns' : '',
    row.full_width ? 'case-section--full-width' : ''].filter(Boolean).join(' ');
}
export function sectionLabel(row, lang) {
  const p = normalizePresentation(row.presentation);
  return lang === 'uk' ? p.label_uk || p.label_en : p.label_en || p.label_uk;
}
export const SECTION_TEMPLATES = [
  { id: 'editorial', title: 'Editorial split', detail: 'Numbered story · text + visual', accent: 'violet' },
  { id: 'showcase', title: 'Visual stage', detail: 'Framed design on a geometric canvas', accent: 'mint' },
  { id: 'statement', title: 'Design statement', detail: 'Large typography · one key decision', accent: 'rose' },
  { id: 'gallery', title: 'Offset gallery', detail: 'Two visuals · staggered composition', accent: 'violet' },
  { id: 'contrast', title: 'Contrast chapter', detail: 'Dark chapter · text + visual', accent: 'amber' },
];
export function makeSectionTemplate(id) {
  const template = SECTION_TEMPLATES.find(t => t.id === id);
  if (!template) throw new Error('Unknown section template');
  const text = (en, uk, style = 'body') => ({ type: 'text', content: {
    text: en, text_en: en, text_uk: uk, textStyle: style, textAlign: 'left', align: 'left',
  } });
  const image = (frame = 'browser') => ({ type: 'image', content: {
    url: '', alt: '', frame, borderRadius: 'lg', shadow: 'none', objectFit: 'contain', aspectRatio: 'auto',
  } });
  let columns;
  if (id === 'statement') columns = [{ span: '1/1', blocks: [text(
    '<h2>One clear design decision.</h2><p>Explain the insight, the choice you made, and why it matters.</p>',
    '<h2>Одне чітке дизайн-рішення.</h2><p>Опишіть інсайт, прийняте рішення та чому воно важливе.</p>', 'lead')] }];
  else if (id === 'showcase') columns = [{ span: '1/1', blocks: [image()] }];
  else if (id === 'gallery') columns = [{ span: '1/2', blocks: [image()] }, { span: '1/2', blocks: [image('canvas')] }];
  else columns = [{ span: '1/2', blocks: [text(
    '<h2>Tell the story behind the design.</h2><p>Add the context, your reasoning, and the decision this visual illustrates.</p>',
    '<h2>Розкажіть історію дизайн-рішення.</h2><p>Додайте контекст, аргументацію та рішення, яке ілюструє зображення.</p>')] },
    { span: '1/2', blocks: [image()] }];
  return { presentation: normalizePresentation({ variant: id, accent: template.accent }), columns };
}

/** Produce one atomic upsert batch, with the clone immediately after its source. */
export function duplicateBlockRows(blocks, blockId, cloneId, now) {
  const ordered = [...blocks].sort((a, b) => a.position - b.position);
  const sourceIndex = ordered.findIndex(b => b.id === blockId);
  if (sourceIndex < 0) throw new Error('Block not found');
  const clone = { ...structuredClone(ordered[sourceIndex]), id: cloneId, created_at: now, updated_at: now };
  ordered.splice(sourceIndex + 1, 0, clone);
  return ordered.map((block, position) => ({ ...block, position, updated_at: now }));
}

export function sectionNumber(row, rows) {
  const chapters = rows.filter(r => ['editorial', 'contrast'].includes(normalizePresentation(r.presentation).variant));
  return String(Math.max(1, chapters.findIndex(r => r.id === row.id) + 1)).padStart(2, '0');
}
