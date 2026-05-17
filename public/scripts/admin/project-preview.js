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

function renderMediaBlock(block) {
  const { content, type } = block;
  if (!content?.url) {
    return '<p class="project-block__empty text-neutral-400 text-sm">No media URL</p>';
  }
  const alt = escapeHtml(content.alt || '');
  if (type === 'media' || content.mediaType === 'video') {
    return `<figure class="project-block__media"><video src="${escapeHtml(content.url)}" class="project-block__video" controls muted playsinline></video></figure>`;
  }
  return `<figure class="project-block__media"><img src="${escapeHtml(content.url)}" alt="${alt}" class="project-block__image" loading="lazy" /></figure>`;
}

export function renderProjectPreview(container, { blocks = [], lang = 'en', meta = {} } = {}) {
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

  const body =
    blocks.length === 0
      ? '<p class="admin-preview__empty">Add blocks to see them here.</p>'
      : blocks
          .map((block) => {
            const content = block.content || {};
            const inner =
              block.type === 'text'
                ? renderTextBlock(content, lang)
                : renderMediaBlock(block);
            return `<article class="project-block project-block--${block.type} ${layoutClass(block.layout)} ${alignClass(content)}" data-block-id="${escapeHtml(block.id)}">${inner}</article>`;
          })
          .join('');

  container.innerHTML = `${header}<div class="project-blocks">${body}</div>`;
}
