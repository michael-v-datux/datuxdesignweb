import { adminFetch } from '/scripts/admin/api.js';
import { showToast } from '/scripts/common/toast.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openGalleryModal() {
  const modal = document.querySelector('[data-admin-modal="media-gallery"]');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
}

function closeGalleryModal() {
  const modal = document.querySelector('[data-admin-modal="media-gallery"]');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
}

function renderGalleryItem(file) {
  const thumb = file.isVideo
    ? `<video src="${escapeHtml(file.url)}" class="admin-gallery-item__asset" muted playsinline></video>`
    : `<img src="${escapeHtml(file.url)}" alt="" class="admin-gallery-item__asset" loading="lazy" />`;
  return `
    <div class="admin-gallery-item" data-gallery-path="${escapeHtml(file.path)}">
      <button type="button" class="admin-gallery-item__select" data-gallery-select data-url="${escapeHtml(file.url)}" data-is-video="${file.isVideo ? '1' : '0'}">
        ${thumb}
      </button>
      <div class="admin-gallery-item__meta">
        <span class="admin-gallery-item__name" title="${escapeHtml(file.path)}">${escapeHtml(file.name)}</span>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-gallery-delete data-path="${escapeHtml(file.path)}">Delete</button>
      </div>
    </div>
  `;
}

export async function loadGalleryGrid(projectId, gridEl) {
  if (!gridEl) return;
  gridEl.innerHTML = '<p class="admin-gallery-grid__loading">Loading…</p>';
  const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  const res = await adminFetch(`/api/admin/gallery${qs}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    gridEl.innerHTML = `<p class="admin-gallery-grid__empty">${escapeHtml(data.error || 'Failed to load')}</p>`;
    return;
  }
  const files = data.files ?? [];
  if (!files.length) {
    gridEl.innerHTML = '<p class="admin-gallery-grid__empty">No files yet. Upload one above.</p>';
    return;
  }
  gridEl.innerHTML = files.map(renderGalleryItem).join('');
}

export function initMediaGallery({ projectId, onSelect }) {
  let activeForm = null;

  const grid = document.querySelector('[data-gallery-grid]');
  const uploadInput = document.querySelector('[data-gallery-upload]');

  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-media-gallery]');
    if (openBtn) {
      activeForm = openBtn.closest('form');
      openGalleryModal();
      loadGalleryGrid(projectId, grid);
    }
  });

  grid?.addEventListener('click', async (e) => {
    const selectBtn = e.target.closest('[data-gallery-select]');
    if (selectBtn && activeForm) {
      const url = selectBtn.dataset.url;
      const isVideo = selectBtn.dataset.isVideo === '1';
      const urlInput = activeForm.querySelector('[name="url"]');
      if (urlInput) urlInput.value = url;
      const typeSelect = activeForm.querySelector('[name="type"]');
      if (typeSelect && isVideo) typeSelect.value = 'media';
      const preview = activeForm.querySelector('[data-media-preview]');
      if (preview && url) {
        preview.classList.remove('hidden');
        preview.innerHTML = isVideo
          ? `<video src="${escapeHtml(url)}" class="admin-media-preview__asset" controls muted playsinline></video>`
          : `<img src="${escapeHtml(url)}" alt="" class="admin-media-preview__asset" />`;
      }
      onSelect?.({ url, isVideo, form: activeForm });
      closeGalleryModal();
      showToast('Media selected', 'success');
      return;
    }

    const delBtn = e.target.closest('[data-gallery-delete]');
    if (!delBtn) return;
    const path = delBtn.dataset.path;
    if (!path || !confirm('Delete this file from storage? This cannot be undone.')) return;

    const res = await adminFetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) {
      showToast('Failed to delete file', 'error');
      return;
    }
    showToast('File deleted', 'success');
    await loadGalleryGrid(projectId, grid);
  });

  uploadInput?.addEventListener('change', async () => {
    const file = uploadInput.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('projectId', projectId || '_shared');
    try {
      showToast('Uploading…', 'info');
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      showToast('Uploaded', 'success');
      uploadInput.value = '';
      await loadGalleryGrid(projectId, grid);
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
      uploadInput.value = '';
    }
  });
}
