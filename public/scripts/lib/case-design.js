/** Shared presentation vocabulary for public pages, previews and section templates. */
export const CASE_THEMES = ['classic', 'fluid', 'playful'];
export function normalizeCaseTheme(value) { return CASE_THEMES.includes(value) ? value : 'classic'; }
export const SECTION_VARIANTS = ['plain', 'editorial', 'showcase', 'statement', 'gallery', 'contrast', 'flow', 'brand', 'panorama', 'mission', 'ticket', 'sequence', 'states'];
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
  { id: 'mission', title: 'Mission chapter', detail: 'Numbered checkpoint · story + visual', accent: 'mint' },
  { id: 'ticket', title: 'Experience ticket', detail: 'Perforated card · text + image', accent: 'mint' },
  { id: 'sequence', title: 'Journey steps', detail: 'Three steps · a connected route', accent: 'mint' },
  { id: 'states', title: 'Screen states', detail: 'Two screens · accessible tabs on the site', accent: 'mint' },
  { id: 'flow', title: 'Flowing story', detail: 'Soft contours · image + narrative', accent: 'violet' },
  { id: 'brand', title: 'Brand interlude', detail: 'Gradient stage · logo + statement', accent: 'rose' },
  { id: 'panorama', title: 'Panoramic visual', detail: 'Edge-to-edge artwork · generous scale', accent: 'violet' },
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
  if (id === 'sequence') columns = ['01', '02', '03'].map(n => ({ span: '1/3', blocks: [text(`<h2>${n} / A clear step</h2><p>Explain this part of the journey.</p>`, `<h2>${n} / Зрозумілий крок</h2><p>Поясніть цю частину шляху.</p>`)] }));
  else if (id === 'states') columns = [{ span: '1/2', blocks: [text('<h2>Choose a date</h2>', '<h2>Оберіть дату</h2>'), image('none')] }, { span: '1/2', blocks: [text('<h2>Review details</h2>', '<h2>Перегляньте деталі</h2>'), image('none')] }];
  else if (id === 'statement') columns = [{ span: '1/1', blocks: [text(
    '<h2>One clear design decision.</h2><p>Explain the insight, the choice you made, and why it matters.</p>',
    '<h2>Одне чітке дизайн-рішення.</h2><p>Опишіть інсайт, прийняте рішення та чому воно важливе.</p>', 'lead')] }];
  else if (id === 'showcase' || id === 'panorama') columns = [{ span: '1/1', blocks: [image()] }];
  else if (id === 'gallery') columns = [{ span: '1/2', blocks: [image()] }, { span: '1/2', blocks: [image('canvas')] }];
  else if (id === 'brand') columns = [{ span: '1/2', blocks: [image('none')] }, { span: '1/2', blocks: [text(
    '<h2>Give the brand a moment.</h2><p>Add a transparent logo and explain its visual character.</p>',
    '<h2>Дайте бренду простір.</h2><p>Додайте логотип із прозорим тлом і розкажіть про його візуальний характер.</p>')] }];
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
  const chapters = rows.filter(r => ['editorial', 'contrast', 'mission', 'states'].includes(normalizePresentation(r.presentation).variant));
  return String(Math.max(1, chapters.findIndex(r => r.id === row.id) + 1)).padStart(2, '0');
}

/** Use the first text heading as the screen-state label; never render its HTML. */
export function columnStateTitle(column, lang, index) {
  const c = column.blocks?.find(b => b.type === 'text')?.content || {};
  const text = lang === 'uk' ? c.text_uk || c.text_en || c.text : c.text_en || c.text_uk || c.text;
  const heading = typeof text === 'string' ? text.match(/<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>/i)?.[1] : '';
  const title = (heading || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '\"').replace(/&#39;/g, "'").trim().slice(0, 90);
  return title || `${lang === 'uk' ? 'Стан' : 'State'} ${index + 1}`;
}
