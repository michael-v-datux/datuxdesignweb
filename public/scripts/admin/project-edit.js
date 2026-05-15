import { showToast } from '/scripts/common/toast.js';

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

function toggleBlockTypeFields(form, type) {
  const textFields = form.querySelectorAll('[data-field-text]');
  const urlFields = form.querySelector('[data-field-url]');
  if (type === 'text') {
    textFields.forEach((el) => el.classList.remove('hidden'));
    urlFields?.classList.add('hidden');
  } else {
    textFields.forEach((el) => el.classList.add('hidden'));
    urlFields?.classList.remove('hidden');
  }
}

function buildContentFromForm(form, type) {
  if (type === 'text') {
    const text_en = form.text_en?.value?.trim() ?? form.text?.value?.trim() ?? '';
    const text_uk = form.text_uk?.value?.trim() ?? '';
    return { text_en, text_uk, text: text_en || text_uk };
  }
  if (type === 'image') {
    return {
      url: form.url?.value?.trim() ?? '',
      alt: form.alt?.value?.trim() ?? '',
      mediaType: 'image',
    };
  }
  return {
    url: form.url?.value?.trim() ?? '',
    mediaType: 'video',
    autoplay: true,
    loop: true,
    muted: true,
  };
}

function fillBlockForm(form, block) {
  const content = block.content || {};
  form.type.value = block.type;
  form.layout.value = block.layout || '1/1';
  if (form.text_en) form.text_en.value = content.text_en ?? content.text ?? '';
  if (form.text_uk) form.text_uk.value = content.text_uk ?? '';
  if (form.text && !form.text_en) form.text.value = content.text ?? '';
  if (form.url) form.url.value = content.url ?? '';
  if (form.alt) form.alt.value = content.alt ?? '';
  toggleBlockTypeFields(form, block.type);
}

function initModals() {
  document.querySelectorAll('[data-admin-modal-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-admin-modal-open');
      if (name) openModal(name);
    });
  });

  document.querySelectorAll('[data-admin-modal-close]').forEach((el) => {
    el.addEventListener('click', () => {
      const modal = el.closest('[data-admin-modal]');
      if (modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

function initProjectForm(projectId) {
  const projectForm = document.querySelector('[data-project-form]');
  const projectSaveBtn = document.querySelector('[data-project-save]');

  projectSaveBtn?.addEventListener('click', async () => {
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

    const res = await fetch(`/api/admin/projects/${projectId}`, {
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
  });
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

    const res = await fetch(`/api/admin/projects/${projectId}/blocks`, {
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

    const res = await fetch(`/api/admin/projects/${projectId}/${blockId}`, {
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
      fillBlockForm(editForm, block);
      openModal('edit-block');
      return;
    }

    const deleteBtn = e.target.closest('[data-block-delete]');
    if (!deleteBtn) return;

    const row = deleteBtn.closest('tr');
    const blockId = row?.dataset.blockId;
    if (!blockId) return;
    if (!confirm('Delete this block?')) return;

    fetch(`/api/admin/projects/${projectId}/${blockId}`, { method: 'DELETE' }).then(
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

function initReorder(projectId) {
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
      const res = await fetch(`/api/admin/projects/${projectId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      if (!res.ok) {
        showToast('Reorder failed', 'error');
        return;
      }

      [...tbody.querySelectorAll('tr')].forEach((r, idx) => {
        const posCell = r.querySelector('td:first-child');
        if (posCell) posCell.textContent = String(idx);
      });
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

  initModals();
  initProjectForm(state.projectId);
  initBlockForms(state.projectId, blocksById);
  initReorder(state.projectId);
}

init();
