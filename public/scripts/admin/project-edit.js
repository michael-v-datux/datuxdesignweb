import { showToast } from '/scripts/common/toast.js';
import { adminFetch } from '/scripts/admin/api.js';
import { renderProjectPreview } from '/scripts/admin/project-preview.js';
import {
  mountRichTextInForm,
  setRichTextValue,
  syncRichTextFromForm,
  destroyRichTextInForm,
} from '/scripts/admin/rich-text.js';

function readState() {
  const el = document.getElementById('project-edit-state');
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

function openModal(name) {
  const modal = document.querySelector(`[data-admin-modal="${name}"]`);
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
}

function closeModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
}

function closeAllModals() {
  document.querySelectorAll('[data-admin-modal]').forEach(closeModal);
}

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';
const MEDIA_ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/webm`;

function toggleBlockTypeFields(form, type) {
  const textFields = form.querySelectorAll('[data-field-text]');
  const textAlignFields = form.querySelectorAll('[data-field-text-align]');
  const urlFields = form.querySelector('[data-field-url]');
  const fileInput = form.querySelector('[data-media-file]');
  if (type === 'text') {
    textFields.forEach((el) => el.classList.remove('hidden'));
    textAlignFields.forEach((el) => el.classList.remove('hidden'));
    urlFields?.classList.add('hidden');
  } else {
    textFields.forEach((el) => el.classList.add('hidden'));
    textAlignFields.forEach((el) => el.classList.add('hidden'));
    urlFields?.classList.remove('hidden');
    if (fileInput) {
      fileInput.accept = type === 'image' ? IMAGE_ACCEPT : MEDIA_ACCEPT;
    }
  }
}

function renderMediaPreview(previewEl, url, mimeHint = '') {
  if (!previewEl || !url) return;
  previewEl.classList.remove('hidden');
  const isVideo =
    mimeHint.startsWith('video/') || /\.(mp4|webm)(\?|$)/i.test(url);
  previewEl.innerHTML = isVideo
    ? `<video src="${url}" controls class="admin-media-preview__asset"></video>`
    : `<img src="${url}" alt="" class="admin-media-preview__asset" />`;
}

async function uploadToStorage(file, projectId) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('projectId', projectId);
  const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

function initMediaUpload(projectId) {
  document.querySelectorAll('[data-media-file]').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = input.closest('form');
      const urlInput = form?.querySelector('[name="url"]');
      const preview = form?.querySelector('[data-media-preview]');

      try {
        showToast('Uploading…', 'info');
        const url = await uploadToStorage(file, projectId);
        if (urlInput) urlInput.value = url;
        renderMediaPreview(preview, url, file.type);
        showToast('File uploaded', 'success');
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Upload failed', 'error');
        input.value = '';
      }
    });
  });

  document.querySelectorAll('[data-project-upload]').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      const targetName = input.getAttribute('data-target');
      const target = document.querySelector(`[name="${targetName}"]`);
      if (!target) return;

      try {
        showToast('Uploading…', 'info');
        const url = await uploadToStorage(file, projectId);
        target.value = url;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        showToast('Image uploaded', 'success');
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Upload failed', 'error');
        input.value = '';
      }
    });
  });
}

function layoutFieldsFromForm(form) {
  const align = form.align?.value || 'center';
  const textAlign = form.text_align?.value || 'left';
  return { align, textAlign };
}

function buildContentFromForm(form, type) {
  syncRichTextFromForm(form);
  const { align, textAlign } = layoutFieldsFromForm(form);
  if (type === 'text') {
    const text_en = form.text_en?.value?.trim() ?? form.text?.value?.trim() ?? '';
    const text_uk = form.text_uk?.value?.trim() ?? '';
    return { text_en, text_uk, text: text_en || text_uk, align, textAlign };
  }
  if (type === 'image') {
    return {
      url: form.url?.value?.trim() ?? '',
      alt: form.alt?.value?.trim() ?? '',
      mediaType: 'image',
      align,
    };
  }
  return {
    url: form.url?.value?.trim() ?? '',
    mediaType: 'video',
    autoplay: true,
    loop: true,
    muted: true,
    align,
  };
}

function fillBlockForm(form, block) {
  const content = block.content || {};
  form.type.value = block.type;
  form.layout.value = block.layout || '1/1';
  if (form.align) form.align.value = content.align || 'center';
  if (form.text_align) form.text_align.value = content.textAlign || 'left';
  if (form.text_en) {
    form.text_en.value = content.text_en ?? content.text ?? '';
    setRichTextValue(form, 'text_en', form.text_en.value);
  }
  if (form.text_uk) {
    form.text_uk.value = content.text_uk ?? '';
    setRichTextValue(form, 'text_uk', form.text_uk.value);
  }
  if (form.text && !form.text_en) form.text.value = content.text ?? '';
  if (form.url) form.url.value = content.url ?? '';
  if (form.alt) form.alt.value = content.alt ?? '';
  toggleBlockTypeFields(form, block.type);
  const preview = form.querySelector('[data-media-preview]');
  if (content.url) renderMediaPreview(preview, content.url);
  else preview?.classList.add('hidden');
}

function initModals() {
  document.querySelectorAll('[data-admin-modal-open]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const name = btn.getAttribute('data-admin-modal-open');
      if (!name) return;
      openModal(name);
      const modal = document.querySelector(`[data-admin-modal="${name}"]`);
      const form = modal?.querySelector('form');
      if (form) await mountRichTextInForm(form);
    });
  });

  document.querySelectorAll('[data-admin-modal-close]').forEach((el) => {
    el.addEventListener('click', () => {
      const modal = el.closest('[data-admin-modal]');
      if (modal) {
        const form = modal.querySelector('form');
        if (form) destroyRichTextInForm(form);
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

function serializeProjectForm(form) {
  if (!form) return '';
  return Array.from(new FormData(form).entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

function initAccordions(projectId) {
  const key = `admin-accordions:${projectId}`;
  const defaults = { metadata: true, blocks: true };

  let saved = defaults;
  try {
    saved = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') };
  } catch {
    /* ignore */
  }

  document.querySelectorAll('[data-admin-accordion]').forEach((el) => {
    const id = el.getAttribute('data-admin-accordion');
    if (!id) return;
    if (typeof saved[id] === 'boolean') el.open = saved[id];

    el.addEventListener('toggle', () => {
      let state = defaults;
      try {
        state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') };
      } catch {
        /* ignore */
      }
      state[id] = el.open;
      localStorage.setItem(key, JSON.stringify(state));
    });
  });
}

function initCancel(projectId) {
  const link = document.querySelector('[data-project-cancel]');
  const form = document.querySelector('[data-project-form]');
  if (!link || !form) return;

  const initial = serializeProjectForm(form);

  link.addEventListener('click', (e) => {
    if (serializeProjectForm(form) !== initial) {
      if (!confirm('Discard unsaved changes and leave this page?')) {
        e.preventDefault();
      }
    }
  });
}

function initProjectForm(projectId) {
  const projectForm = document.querySelector('[data-project-form]');
  const projectSaveBtns = document.querySelectorAll('[data-project-save]');

  const saveHandler = async () => {
    if (!projectForm) return;
    const formData = new FormData(projectForm);
    const password = formData.get('password')?.toString() ?? '';

    const payload = {
      slug: formData.get('slug') || null,
      title_en: formData.get('title_en') || null,
      title_uk: formData.get('title_uk') || null,
      description_en: formData.get('description_en') || null,
      description_uk: formData.get('description_uk') || null,
      thumbnail_url: formData.get('thumbnail_url') || null,
      cover_url: formData.get('cover_url') || null,
      category_en: formData.get('category_en') || null,
      category_uk: formData.get('category_uk') || null,
      status: formData.get('status') || 'draft',
      is_published: projectForm.querySelector("input[name='is_published']")?.checked,
      is_protected: projectForm.querySelector("input[name='is_protected']")?.checked,
    };

    if (password) payload.password = password;

    const res = await adminFetch(`/api/admin/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      showToast('Failed to save project', 'error');
      return;
    }

    showToast('Project saved', 'success');
    if (password) {
      const pwdInput = projectForm.querySelector("input[name='password']");
      if (pwdInput) pwdInput.value = '';
    }
  };

  projectSaveBtns.forEach((btn) => btn.addEventListener('click', saveHandler));
}

function initBlockForms(projectId, blocksById) {
  const createForm = document.querySelector('[data-block-create-form]');
  const editForm = document.querySelector('[data-block-edit-form]');

  [createForm, editForm].forEach((form) => {
    form?.querySelector("select[name='type']")?.addEventListener('change', (e) => {
      toggleBlockTypeFields(form, e.target.value);
    });
  });

  createForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const type = form.type.value;
    const layout = form.layout.value || '1/1';
    const content = buildContentFromForm(form, type);

    const res = await adminFetch(`/api/admin/projects/${projectId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, layout, content }),
    });

    if (!res.ok) {
      showToast('Failed to create block', 'error');
      return;
    }

    showToast('Block created', 'success');
    location.reload();
  });

  editForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const blockId = form.block_id?.value;
    if (!blockId) return;

    const type = form.type.value;
    const layout = form.layout.value || '1/1';
    const content = buildContentFromForm(form, type);

    const res = await adminFetch(`/api/admin/projects/${projectId}/${blockId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, layout, content }),
    });

    if (!res.ok) {
      showToast('Failed to update block', 'error');
      return;
    }

    showToast('Block updated', 'success');
    location.reload();
  });

  document.querySelector('[data-blocks-table]')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-block-edit]');
    if (editBtn) {
      const row = editBtn.closest('tr');
      const blockId = row?.dataset.blockId;
      const block = blocksById[blockId];
      if (!block || !editForm) return;
      editForm.block_id.value = blockId;
      openModal('edit-block');
      mountRichTextInForm(editForm).then(() => fillBlockForm(editForm, block));
      return;
    }

    const deleteBtn = e.target.closest('[data-block-delete]');
    if (!deleteBtn) return;

    const row = deleteBtn.closest('tr');
    const blockId = row?.dataset.blockId;
    if (!blockId) return;
    if (!confirm('Delete this block?')) return;

    adminFetch(`/api/admin/projects/${projectId}/${blockId}`, { method: 'DELETE' }).then(
      async (res) => {
        if (!res.ok) {
          showToast('Failed to delete block', 'error');
          return;
        }
        row.remove();
        showToast('Block deleted', 'success');
      }
    );
  });
}

function initReorder(projectId, onOrderChange) {
  const table = document.querySelector('[data-blocks-table]');
  const tbody = table?.querySelector('tbody');
  if (!tbody) return;

  let dragSrcRow = null;

  tbody.querySelectorAll("tr[draggable='true']").forEach((row) => {
    row.addEventListener('dragstart', (e) => {
      dragSrcRow = row;
      e.dataTransfer.effectAllowed = 'move';
      row.classList.add('opacity-60');
    });

    row.addEventListener('dragend', () => {
      dragSrcRow = null;
      row.classList.remove('opacity-60');
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    row.addEventListener('drop', async (e) => {
      e.preventDefault();
      const targetRow = row;
      if (!dragSrcRow || dragSrcRow === targetRow) return;

      if ([...tbody.children].indexOf(dragSrcRow) < [...tbody.children].indexOf(targetRow)) {
        tbody.insertBefore(dragSrcRow, targetRow.nextSibling);
      } else {
        tbody.insertBefore(dragSrcRow, targetRow);
      }

      const order = [...tbody.querySelectorAll('tr')].map((r) => r.dataset.blockId);
      const res = await adminFetch(`/api/admin/projects/${projectId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      if (!res.ok) {
        showToast('Reorder failed', 'error');
        return;
      }

      [...tbody.querySelectorAll('tr')].forEach((r, idx) => {
        const posCell = r.querySelector('[data-block-position]');
        if (posCell) posCell.textContent = String(idx);
      });
      onOrderChange?.();
    });
  });
}

function collectMetaFromForm(form) {
  if (!form) return {};
  const fd = new FormData(form);
  return {
    title_en: fd.get('title_en')?.toString() ?? '',
    title_uk: fd.get('title_uk')?.toString() ?? '',
    description_en: fd.get('description_en')?.toString() ?? '',
    description_uk: fd.get('description_uk')?.toString() ?? '',
    category_en: fd.get('category_en')?.toString() ?? '',
    category_uk: fd.get('category_uk')?.toString() ?? '',
    thumbnail_url: fd.get('thumbnail_url')?.toString() ?? '',
  };
}

function collectBlocksFromState(state, tbody) {
  if (!tbody) return state.blocks ?? [];
  const order = [...tbody.querySelectorAll('tr[data-block-id]')].map((r) => r.dataset.blockId);
  const byId = Object.fromEntries((state.blocks ?? []).map((b) => [b.id, b]));
  return order.map((id, position) => ({ ...byId[id], position })).filter(Boolean);
}

function initLivePreview(state, blocksById, onEditBlock) {
  const container = document.querySelector('[data-project-preview]');
  const projectForm = document.querySelector('[data-project-form]');
  const tbody = document.querySelector('[data-blocks-table] tbody');
  if (!container) return;

  let previewLang = 'en';

  const refresh = () => {
    const blocks = collectBlocksFromState(state, tbody);
    renderProjectPreview(container, {
      blocks,
      lang: previewLang,
      meta: collectMetaFromForm(projectForm),
    });
  };

  container.addEventListener('click', (e) => {
    const article = e.target.closest('[data-block-id]');
    if (!article?.dataset.blockId || !onEditBlock) return;
    onEditBlock(article.dataset.blockId);
  });

  document.querySelectorAll('[data-preview-lang] button').forEach((btn) => {
    btn.addEventListener('click', () => {
      previewLang = btn.dataset.lang || 'en';
      document
        .querySelectorAll('[data-preview-lang] button')
        .forEach((b) => b.classList.toggle('is-active', b === btn));
      refresh();
    });
  });

  projectForm?.addEventListener('input', refresh);
  refresh();
  return refresh;
}

function initFileInputLabels() {
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    const label = input.closest('.admin-form__field')?.querySelector('[data-file-label]');
    if (!label) return;
    input.addEventListener('change', () => {
      const name = input.files?.[0]?.name;
      label.textContent = name || 'No file chosen';
    });
  });
}

function init() {
  const state = readState();
  if (!state?.projectId) return;

  const blocksById = {};
  for (const b of state.blocks ?? []) {
    blocksById[b.id] = b;
  }

  const editForm = document.querySelector('[data-block-edit-form]');

  const refreshPreview = initLivePreview(state, blocksById, (blockId) => {
    const block = blocksById[blockId];
    if (!block || !editForm) return;
    editForm.block_id.value = blockId;
    openModal('edit-block');
    mountRichTextInForm(editForm).then(() => fillBlockForm(editForm, block));
  });

  initAccordions(state.projectId);
  initCancel(state.projectId);
  initModals();
  initProjectForm(state.projectId);
  initBlockForms(state.projectId, blocksById);
  initReorder(state.projectId, refreshPreview);
  initMediaUpload(state.projectId);
  initFileInputLabels();
}

init();
