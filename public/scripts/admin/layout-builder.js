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

function columnSpanClass(span) {
  const key = String(span || '1/1').replace('/', '-');
  return `admin-layout-column--span-${key}`;
}

function blockAlignClass(block) {
  const align = block.content?.align;
  if (align === 'left' || align === 'right' || align === 'center') {
    return `admin-layout-block--align-${align}`;
  }
  return 'admin-layout-block--align-center';
}

export function buildReorderPayload(container) {
  if (!container) return { action: 'reorder', rows: [] };
  const rows = [...container.querySelectorAll('.admin-layout-row')].map((rowEl) => ({
    id: rowEl.dataset.rowId,
    columns: [...rowEl.querySelectorAll('.admin-layout-column')].map((colEl) => ({
      id: colEl.dataset.columnId,
      blocks: [...colEl.querySelectorAll('.admin-layout-block')].map((b) => b.dataset.blockId),
    })),
  }));
  return { action: 'reorder', rows };
}

function renderColumn(col, rowId) {
  const blocksHtml =
    col.blocks.length === 0
      ? ''
      : col.blocks
          .map(
            (b) => `
        <div class="admin-layout-block ${blockAlignClass(b)}" data-block-id="${escapeHtml(b.id)}" draggable="true">
          <span class="admin-layout-block__drag" aria-hidden="true">⋮</span>
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
    <div class="admin-layout-column ${columnSpanClass(col.span)}" data-column-id="${escapeHtml(col.id)}" data-row-id="${escapeHtml(rowId)}" data-column-span="${escapeHtml(col.span)}">
      <div class="admin-layout-column__head">
        <span class="admin-layout-column__span">${escapeHtml(col.span)}</span>
        <select class="admin-input admin-input--sm" data-column-span data-column-id="${escapeHtml(col.id)}">
          ${['1/4', '1/3', '1/2', '1/1', 'full'].map((s) => `<option value="${s}" ${col.span === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-delete-column data-row-id="${escapeHtml(rowId)}" data-column-id="${escapeHtml(col.id)}">×</button>
      </div>
      <div class="admin-layout-column__body" data-column-drop>${blocksHtml || '<p class="admin-layout-column__empty">Drop blocks here</p>'}</div>
      <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-add-block data-column-id="${escapeHtml(col.id)}">+ Block</button>
    </div>
  `;
}

function renderRow(row) {
  const cols = row.columns.map((c) => renderColumn(c, row.id)).join('');
  return `
    <div class="admin-layout-row" data-row-id="${escapeHtml(row.id)}">
      <div class="admin-layout-row__head">
        <span class="admin-layout-row__drag" draggable="true" aria-hidden="true" title="Drag to reorder row">⋮⋮</span>
        <span class="admin-layout-row__label">Row ${row.position + 1}</span>
        <label class="admin-layout-row__full-width">
          <input type="checkbox" data-row-full-width data-row-id="${escapeHtml(row.id)}" ${row.full_width ? 'checked' : ''} />
          Full width
        </label>
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

export function initLayoutDragDrop(container, { onReorder }) {
  if (!container || !onReorder) return;

  let dragBlock = null;
  let dragRow = null;

  const clearDropHints = () => {
    container.querySelectorAll('.is-drop-target').forEach((el) => el.classList.remove('is-drop-target'));
    container.querySelectorAll('.is-dragging').forEach((el) => el.classList.remove('is-dragging'));
  };

  container.addEventListener('dragstart', (e) => {
    const block = e.target.closest('.admin-layout-block');
    if (block) {
      dragBlock = block;
      dragRow = null;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', block.dataset.blockId || '');
      block.classList.add('is-dragging');
      return;
    }

    const handle = e.target.closest('.admin-layout-row__drag');
    if (handle) {
      dragRow = handle.closest('.admin-layout-row');
      dragBlock = null;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragRow?.dataset.rowId || '');
      dragRow?.classList.add('is-dragging');
    }
  });

  container.addEventListener('dragend', () => {
    dragBlock = null;
    dragRow = null;
    clearDropHints();
  });

  container.addEventListener('dragover', (e) => {
    if (dragBlock) {
      const drop = e.target.closest('[data-column-drop]');
      if (drop) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        drop.classList.add('is-drop-target');
      }
      return;
    }
    if (dragRow) {
      const targetRow = e.target.closest('.admin-layout-row');
      if (targetRow && targetRow !== dragRow) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        targetRow.classList.add('is-drop-target');
      }
    }
  });

  container.addEventListener('dragleave', (e) => {
    const drop = e.target.closest('[data-column-drop]');
    if (drop) drop.classList.remove('is-drop-target');
    const row = e.target.closest('.admin-layout-row');
    if (row) row.classList.remove('is-drop-target');
  });

  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    clearDropHints();

    if (dragBlock) {
      const dropBody = e.target.closest('[data-column-drop]');
      if (!dropBody) return;

      const targetBlock = e.target.closest('.admin-layout-block');
      if (targetBlock && targetBlock !== dragBlock) {
        dropBody.insertBefore(dragBlock, targetBlock);
      } else {
        dropBody.appendChild(dragBlock);
      }

      const empty = dropBody.querySelector('.admin-layout-column__empty');
      if (empty) empty.remove();

      await onReorder(buildReorderPayload(container));
      return;
    }

    if (dragRow) {
      const targetRow = e.target.closest('.admin-layout-row');
      if (!targetRow || targetRow === dragRow) return;

      const parent = container;
      if ([...parent.children].indexOf(dragRow) < [...parent.children].indexOf(targetRow)) {
        parent.insertBefore(dragRow, targetRow.nextSibling);
      } else {
        parent.insertBefore(dragRow, targetRow);
      }

      await onReorder(buildReorderPayload(container));
    }
  });
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

  const postReorder = async () => {
    const payload = buildReorderPayload(container);
    const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      showToast('Failed to save order', 'error');
      return false;
    }
    setLayout(await res.json());
    renderLayoutBuilder(container, getLayout());
    onRefreshPreview?.();
    return true;
  };

  initLayoutDragDrop(container, { onReorder: postReorder });

  const addRowHandler = async () => {
    const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add-row', span: '1/1' }),
    });
    if (!res.ok) {
      showToast('Failed to add row', 'error');
      return;
    }
    await refresh();
    showToast('Row added', 'success');
  };

  document.querySelectorAll('[data-layout-add-row]').forEach((btn) => {
    btn.addEventListener('click', addRowHandler);
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

    const delCol = e.target.closest('[data-delete-column]');
    if (delCol) {
      if (!confirm('Delete this column and all blocks inside it?')) return;
      const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-column',
          row_id: delCol.dataset.rowId,
          column_id: delCol.dataset.columnId,
        }),
      });
      if (!res.ok) {
        showToast('Failed to delete column', 'error');
        return;
      }
      await refresh();
      showToast('Column deleted', 'success');
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
    const fullWidthToggle = e.target.closest('[data-row-full-width]');
    if (fullWidthToggle) {
      const rowId = fullWidthToggle.dataset.rowId;
      const res = await adminFetch(`/api/admin/projects/${projectId}/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-row-full-width',
          row_id: rowId,
          full_width: fullWidthToggle.checked,
        }),
      });
      if (!res.ok) {
        showToast('Failed to update row', 'error');
        return;
      }
      await refresh();
      return;
    }

    const spanSelect = e.target.closest('[data-column-span]');
    if (!spanSelect) return;
    const columnId = spanSelect.dataset.columnId;
    const span = spanSelect.value;
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
  return { refresh, addRow: addRowHandler };
}
