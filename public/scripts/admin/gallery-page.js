import { loadGalleryGrid } from '/scripts/admin/media-gallery.js';
import { adminFetch } from '/scripts/admin/api.js';
import { showToast } from '/scripts/common/toast.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderGalleryItem(file) {
  const thumb = file.isVideo
    ? `<video src="${escapeHtml(file.url)}" class="admin-gallery-item__asset" muted playsinline></video>`
    : `<img src="${escapeHtml(file.url)}" alt="" class="admin-gallery-item__asset" loading="lazy" />`;
  return `
    <div class="admin-gallery-item">
      <a href="${escapeHtml(file.url)}" target="_blank" rel="noopener noreferrer" class="admin-gallery-item__select">
        ${thumb}
      </a>
      <div class="admin-gallery-item__meta">
        <span class="admin-gallery-item__name" title="${escapeHtml(file.path)}">${escapeHtml(file.projectId)}/${escapeHtml(file.name)}</span>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-gallery-delete data-path="${escapeHtml(file.path)}">Delete</button>
      </div>
    </div>
  `;
}

async function loadAll(grid) {
  await loadGalleryGrid(null, grid);
  // Re-render with page template (loadGalleryGrid uses modal template) — override:
  const res = await adminFetch('/api/admin/gallery');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    grid.innerHTML = `<p class="admin-gallery-grid__empty">${escapeHtml(data.error || 'Failed to load')}</p>`;
    return;
  }
  const files = data.files ?? [];
  grid.innerHTML = files.length
    ? files.map(renderGalleryItem).join('')
    : '<p class="admin-gallery-grid__empty">No files yet.</p>';
}

const grid = document.querySelector('[data-gallery-page-grid]');
const upload = document.querySelector('[data-gallery-page-upload]');

loadAll(grid);

grid?.addEventListener('click', async (e) => {
  const delBtn = e.target.closest('[data-gallery-delete]');
  if (!delBtn) return;
  const path = delBtn.dataset.path;
  if (!path || !confirm('Delete this file from storage?')) return;
  const res = await adminFetch('/api/admin/gallery', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) {
    showToast('Failed to delete', 'error');
    return;
  }
  showToast('Deleted', 'success');
  await loadAll(grid);
});

upload?.addEventListener('change', async () => {
  const file = upload.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('projectId', '_shared');
  try {
    showToast('Uploading…', 'info');
    const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    showToast('Uploaded', 'success');
    upload.value = '';
    await loadAll(grid);
  } catch (err) {
    showToast(err.message || 'Upload failed', 'error');
    upload.value = '';
  }
});
