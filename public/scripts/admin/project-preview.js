import { groupBlocksIntoRows, layoutFraction } from '/scripts/lib/project-rows.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layoutClass(layout) {
  const key = String(layout || '1/1').replace('/', '-');
  return `project-block--layout-${key}`;
}

function columnFlexStyle(span) {
  const f = layoutFraction(span);
  if (f >= 1 - 0.001) return 'flex: 1 1 100%; max-width: 100%;';
  const pct = (f * 100).toFixed(3);
  return `flex: 1 1 calc(${pct}% - 0.625rem); max-width: calc(${pct}% - 0.625rem);`;
}

function alignClass(content) {
  const align = content?.align;
  if (align === 'left' || align === 'right' || align === 'center') {
    return `project-block--align-${align}`;
  }
  return 'project-block--align-center';
}

function textAlignClass(content, type) {
  if (type !== 'text') return '';
  const ta = content?.textAlign;
  if (ta === 'left' || ta === 'center' || ta === 'right' || ta === 'justify') {
    return `project-block__text--align-${ta}`;
  }
  return 'project-block__text--align-left';
}

function blockText(content, lang) {
  if (lang === 'uk' && content.text_uk) return content.text_uk;
  if (lang === 'en' && content.text_en) return content.text_en;
  return content.text || content.text_en || content.text_uk || '';
}

function isHtml(str) {
  return /<[a-z][\s\S]*>/i.test(str);
}

function renderTextBlock(content, lang) {
  const raw = blockText(content, lang);
  const ta = textAlignClass(content, 'text');
  if (!raw) return '<p class="project-block__empty text-neutral-400 text-sm">—</p>';
  if (isHtml(raw)) {
    return `<div class="project-block__text project-block__text--html ${ta}">${raw}</div>`;
  }
  return `<div class="project-block__text ${ta}"><p class="text-lg leading-relaxed whitespace-pre-wrap">${escapeHtml(raw)}</p></div>`;
}

function mediaFigureClasses(content) {
  const classes = ['project-block__media'];
  const radius = content.borderRadius || 'md';
  if (radius && radius !== 'md' && radius !== 'custom') {
    classes.push(`project-block__media--radius-${radius}`);
  }
  if (content.objectFit === 'contain') classes.push('project-block__media--fit-contain');
  const shadow = content.shadow || 'md';
  if (shadow && shadow !== 'md') classes.push(`project-block__media--shadow-${shadow}`);
  return classes.join(' ');
}

function mediaFigureStyle(content) {
  if (content.borderRadius === 'custom' && content.borderRadiusCustom) {
    const v = String(content.borderRadiusCustom).trim();
    if (/^\d+(\.\d+)?(px|rem|%)$/.test(v) || /^\d+(\.\d+)?$/.test(v)) {
      const radius = /^\d/.test(v) && !/[a-z%]$/i.test(v) ? `${v}px` : v;
      return `border-radius: ${radius};`;
    }
  }
  return '';
}

function renderMediaBlock(block) {
  const { content, type } = block;
  if (!content?.url) {
    return '<p class="project-block__empty text-neutral-400 text-sm">No media URL</p>';
  }
  const alt = escapeHtml(content.alt || '');
  const figClass = mediaFigureClasses(content);
  const figStyle = mediaFigureStyle(content);
  const styleAttr = figStyle ? ` style="${figStyle}"` : '';
  if (type === 'media' || content.mediaType === 'video') {
    return `<figure class="${figClass}"${styleAttr}><video src="${escapeHtml(content.url)}" class="project-block__video" controls muted playsinline></video></figure>`;
  }
  return `<figure class="${figClass}"${styleAttr}><img src="${escapeHtml(content.url)}" alt="${alt}" class="project-block__image" loading="lazy" /></figure>`;
}

function renderBlockArticle(block, lang, layoutSpan, interactive) {
  const content = block.content || {};
  const span = layoutSpan || block.layout || '1/1';
  const inner =
    block.type === 'text' ? renderTextBlock(content, lang) : renderMediaBlock(block);
  const dragAttr = interactive ? ' draggable="true"' : '';
  return `<article class="project-block project-block--${block.type} ${layoutClass(span)} ${alignClass(content)} admin-preview__block" data-block-id="${escapeHtml(block.id)}"${dragAttr} title="Click to edit">${inner}</article>`;
}

function previewAddBtn(label, attrs) {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `data-${k}="${escapeHtml(v)}"`)
    .join(' ');
  return `<button type="button" class="admin-preview-add" ${attrStr}>${escapeHtml(label)}</button>`;
}

function renderPreviewColumn(col, rowId, lang, interactive) {
  const blocks = col.blocks
    .map((b) => renderBlockArticle(b, lang, col.span, interactive))
    .join('');
  const addBlock = interactive
    ? previewAddBtn('+ Block', { 'preview-add-block': '', 'column-id': col.id })
    : '';
  const dropClass = interactive ? ' admin-preview-col__body--droppable' : '';
  return `
    <div class="admin-preview-col" data-column-id="${escapeHtml(col.id)}" data-row-id="${escapeHtml(rowId)}" style="${columnFlexStyle(col.span)}">
      <div class="admin-preview-col__body${dropClass}" data-preview-column-body>${blocks || '<p class="admin-preview-col__empty">Empty</p>'}</div>
      ${addBlock}
    </div>
  `;
}

function renderExplicitLayoutHtml(layout, lang, interactive) {
  const rows = layout?.rows ?? [];
  return rows
    .map((row) => {
      let rowClass =
        row.columns.length <= 1 ? 'project-row project-row--single' : 'project-row';
      if (row.full_width) rowClass += ' project-row--full-width';
      const cols = row.columns
        .map((col) => renderPreviewColumn(col, row.id, lang, interactive))
        .join('');
      const addCol = interactive
        ? previewAddBtn('+ Column', { 'preview-add-column': '', 'row-id': row.id })
        : '';
      return `
        <div class="${rowClass} admin-preview-row" data-row-id="${escapeHtml(row.id)}">
          ${cols}
          ${interactive ? `<div class="admin-preview-row__actions">${addCol}</div>` : ''}
        </div>
      `;
    })
    .join('');
}

function renderPackedRowsHtml(blocks, lang, interactive) {
  const rows = groupBlocksIntoRows(blocks);
  return rows
    .map((rowBlocks) => {
      const rowClass = rowBlocks.length === 1 ? 'project-row project-row--single' : 'project-row';
      const cells = rowBlocks
        .map((b) => renderBlockArticle(b, lang, b.layout, interactive))
        .join('');
      return `<div class="${rowClass}">${cells}</div>`;
    })
    .join('');
}

function flattenLayout(layout) {
  const blocks = [];
  let position = 0;
  for (const row of layout?.rows ?? []) {
    for (const col of row.columns) {
      for (const block of col.blocks) {
        blocks.push({ ...block, layout: col.span, position: position++ });
      }
    }
  }
  return blocks;
}

export function renderProjectPreview(
  container,
  { blocks = [], layout = null, lang = 'en', meta = {}, interactive = false } = {}
) {
  if (!container) return;

  const title = lang === 'uk' ? meta.title_uk || meta.title_en : meta.title_en || meta.title_uk;
  const description =
    lang === 'uk'
      ? meta.description_uk || meta.description_en
      : meta.description_en || meta.description_uk;

  const header = `
    <header class="admin-preview__hero">
      ${meta.thumbnail_url ? `<img src="${escapeHtml(meta.thumbnail_url)}" alt="" class="admin-preview__thumb" />` : ''}
      <h1 class="admin-preview__title">${escapeHtml(title || 'Untitled project')}</h1>
      ${description ? `<p class="admin-preview__desc">${escapeHtml(description)}</p>` : ''}
      ${meta.category_en || meta.category_uk ? `<p class="admin-preview__category">${escapeHtml(lang === 'uk' ? meta.category_uk || meta.category_en : meta.category_en || meta.category_uk)}</p>` : ''}
    </header>
  `;

  const useLayout = Boolean(layout?.rows?.length);
  const flatBlocks = useLayout ? flattenLayout(layout) : blocks;

  let body;
  if (flatBlocks.length === 0) {
    const addRow = interactive
      ? `<p class="admin-preview__empty">No content yet. ${previewAddBtn('+ Add row', { 'preview-add-row': '' })}</p>`
      : '<p class="admin-preview__empty">Add rows and blocks to see them here.</p>';
    body = addRow;
  } else if (useLayout) {
    body = renderExplicitLayoutHtml(layout, lang, interactive);
  } else {
    body = renderPackedRowsHtml(blocks, lang, interactive);
  }

  const footer = interactive
    ? `<div class="admin-preview-footer">${previewAddBtn('+ Add row', { 'preview-add-row': '' })}</div>`
    : '';

  container.innerHTML = `${header}<div class="project-blocks admin-preview-blocks${interactive ? ' admin-preview-blocks--interactive' : ''}">${body}</div>${footer}`;
  container.classList.toggle('admin-preview--interactive', interactive);
}

export { flattenLayout };
