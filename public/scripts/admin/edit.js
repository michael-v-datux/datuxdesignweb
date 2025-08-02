import { supabase } from '/src/lib/supabaseClient.js';
import { showToast } from '/js/common/toast.js';

const projectId = window.location.pathname.split('/').filter(Boolean).pop();
const form = document.getElementById('project-form');
const blocksContainer = document.getElementById('blocks');
const addBlockBtn = document.getElementById('add-block');

async function loadProject() {
  const { data: project, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
  if (error) return showToast('Failed to load project', 'error');

  for (const key in project) {
    const el = document.getElementById(key);
    if (el) {
      if (el.type === 'checkbox') el.checked = project[key];
      else el.value = project[key] || '';
    }
  }
}

async function loadBlocks() {
  const { data: blocks, error } = await supabase.from('project_blocks').select('*').eq('project_id', projectId).order('position');
  if (error) return showToast('Failed to load blocks', 'error');

  blocksContainer.innerHTML = '';
  blocks.forEach(block => {
    const div = document.createElement('div');
    div.className = 'block-item p-4 border rounded bg-gray-100 relative';
    div.dataset.id = block.id;
    div.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="block-drag-handle cursor-move">☰</span>
        <span class="text-sm text-gray-500">${block.type}</span>
      </div>
      <textarea class="w-full p-2 border rounded block-textarea">${block.content?.text || ''}</textarea>
      <button class="delete-block bg-red-500 text-white px-2 py-1 mt-2 rounded">Delete</button>
    `;
    div.querySelector('.delete-block').addEventListener('click', () => deleteBlock(block.id));
    div.querySelector('.block-textarea').addEventListener('change', (e) => updateBlock(block.id, e.target.value));
    blocksContainer.appendChild(div);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const updatedData = Object.fromEntries(formData.entries());
  updatedData.is_protected = formData.get('is_protected') === 'on';

  const { error } = await supabase.from('projects').update(updatedData).eq('id', projectId);
  if (error) return showToast('Update failed', 'error');
  showToast('Project updated!');
});

async function addBlock() {
  const { error } = await supabase.from('project_blocks').insert([{ project_id: projectId, type: 'text', content: { text: '' }, position: blocksContainer.children.length + 1 }]);
  if (error) return showToast('Failed to add block', 'error');
  loadBlocks();
}

async function deleteBlock(blockId) {
  const { error } = await supabase.from('project_blocks').delete().eq('id', blockId);
  if (error) return showToast('Delete failed', 'error');
  loadBlocks();
}

async function updateBlock(blockId, text) {
  await supabase.from('project_blocks').update({ content: { text } }).eq('id', blockId);
}

addBlockBtn.addEventListener('click', addBlock);

loadProject();
loadBlocks();
