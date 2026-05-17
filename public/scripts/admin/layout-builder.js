import { adminFetch } from '/scripts/admin/api.js';
import { showToast } from '/scripts/common/toast.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function blockPreview(block) {
  if (block.type === 'text') {
    const t = block.content?.text_en || block.content?.text_uk || block.content?.text || '';
    const short = t.replace(/<[^>]+>/g, '').slice(0, 50);
    return short || 'Text block';
  }
  if (block.content?.url) {
    return String(block.content.url).split('/').pop() || 'Media';
  }
  return block.type;
}

function renderColumn(col, rowId) {
  const blocksHtml =
    col.blocks.length === 0
      ? '<p class="admin-layout-column__empty">Empty column</p>'
      : col.blocks
          .map(
            (b) => `
        <div class="admin-layout-block" data-block-id="${escapeHtml(b.id)}">
          <span class="admin-pill admin-pill--${escapeHtml(b.type)}">${escapeHtml(b.type)}</span>
          <span class="admin-layout-block__preview">${escapeHtml(blockPreview(b))}</span>
          <div class="admin-layout-block__actions">
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-block-edit data-block-id="${escapeHtml(b.id)}">Edit</button>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-block-delete data-block-id="${escapeHtml(b.id)}">Delete</button>
          </div>
        </div>`
          )
          .join('');

  return `
    <div class="admin-layout-column" data-column-id="${escapeHtml(col.id)}" data-row-id="${escapeHtml(rowId)}">
      <div class="admin-layout-column__head">
        <span class="admin-layout-column__span">${escapeHtml(col.span)}</span>
        <select class="admin-input admin-input--sm" data-column-span data-column-id="${escapeHtml(col.id)}">
          ${['1/4', '1/3', '1/2', '1/1', 'full'].map((s) => `<option value="${s}" ${col.span === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="admin-layout-column__body">${blocksHtml}</div>
      <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-add-block data-column-id="${escapeHtml(col.id)}">+ Block</button>
    </div>
  `;
}

function renderRow(row) {
  const cols = row.columns.map((c) => renderColumn(c, row.id)).join('');
  return `
    <div class="admin-layout-row" data-row-id="${escapeHtml(row.id)}" draggable="true">
      <div class="admin-layout-row__head">
        <span class="admin-layout-row__drag" aria-hidden="true">⋮⋮</span>
        <span class="admin-layout-row__label">Row ${row.position + 1}</span>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-delete-row data-row-id="${escapeHtml(row.id)}">Delete row</button>
      </div>
      <div class="admin-layout-row__columns">${cols}</div>
      <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-add-column data-row-id="${escapeHtml(row.id)}">+ Column</button>
    </div>
  `;
}

export function renderLayoutBuilder(container, layout) {
  if (!container) return;
  const rows = layout?.rows ?? [];
  if (!rows.length) {
    container.innerHTML = `
      <p class="admin-layout-builder__empty">No rows yet. Add a row to start building your case study layout.</p>
    `;
    return;
  }
  container.innerHTML = rows.map(renderRow).join('');
}

export function initLayoutBuilder({
  projectId,
  container,
  getLayout,
  setLayout,
  onEditBlock,
  onBlockDelete,
  onRefreshPreview,
  openAddBlockModal,
}) {
  if (!container) return;

  const refresh = async () => {
    const res = await adminFetch(`/api/admin/projects/${projectId}/layout`);
    if (!res.ok) {
      showToast('Failed to load layout', 'error');
      return;
    }
    const layout = await res.json();
    setLayout(layout);
    renderLayoutBuilder(container, layout);
    onRefreshPreview?.();
  };

  document.querySelector('[data-layout-add-row]')?.addEventListener('click', async () => {
    const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add-row', span: '1/1' }),
    });
    if (!res.ok) {
      showToast('Failed to add row', 'error');
      return;
    }
    const data = await res.json();
    setLayout(data.layout ?? data);
    await refresh();
    showToast('Row added', 'success');
  });

  container.addEventListener('click', async (e) => {
    const addCol = e.target.closest('[data-add-column]');
    if (addCol) {
      const rowId = addCol.dataset.rowId;
      const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-column', row_id: rowId, span: '1/2' }),
      });
      if (!res.ok) {
        showToast('Failed to add column', 'error');
        return;
      }
      await refresh();
      showToast('Column added', 'success');
      return;
    }

    const delRow = e.target.closest('[data-delete-row]');
    if (delRow) {
      if (!confirm('Delete this row and all its content?')) return;
      const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-row', row_id: delRow.dataset.rowId }),
      });
      if (!res.ok) {
        showToast('Failed to delete row', 'error');
        return;
      }
      await refresh();
      showToast('Row deleted', 'success');
      return;
    }

    const addBlock = e.target.closest('[data-add-block]');
    if (addBlock) {
      openAddBlockModal?.(addBlock.dataset.columnId);
      return;
    }

    const editBtn = e.target.closest('[data-block-edit]');
    if (editBtn?.dataset.blockId) {
      onEditBlock?.(editBtn.dataset.blockId);
      return;
    }

    const deleteBtn = e.target.closest('[data-block-delete]');
    if (deleteBtn?.dataset.blockId) {
      onBlockDelete?.(deleteBtn.dataset.blockId);
    }
  });

  container.addEventListener('change', async (e) => {
    const spanSelect = e.target.closest('[data-column-span]');
    if (!spanSelect) return;
    const columnId = spanSelect.dataset.columnId;
    const span = spanSelect.value;
    const layout = getLayout();
    const col = layout?.rows?.flatMap((r) => r.columns).find((c) => c.id === columnId);
    if (!col) return;
    const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-column', column_id: columnId, span }),
    });
    if (!res.ok) {
      showToast('Failed to update column', 'error');
      return;
    }
    await refresh();
  });

  renderLayoutBuilder(container, getLayout());
  return { refresh };
}
