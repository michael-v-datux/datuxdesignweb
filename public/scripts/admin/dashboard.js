import { supabase } from '/src/lib/supabaseClient.js';
import { showToast } from '/js/common/toast.js';

const projectsContainer = document.getElementById('projects');

async function loadProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
  if (error) return showToast('Failed to load projects', 'error');

  projectsContainer.innerHTML = '';
  data.forEach(proj => {
    const div = document.createElement('div');
    div.className = 'p-4 border rounded flex justify-between items-center';
    div.innerHTML = `
      <div>
        <h3 class="font-bold">${proj.title_en}</h3>
        <p class="text-sm text-gray-500">${proj.status}</p>
      </div>
      <div class="flex gap-2">
        <a href="/admin/projects/${proj.id}/edit" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</a>
        <button data-id="${proj.id}" class="delete bg-red-500 text-white px-2 py-1 rounded">Delete</button>
      </div>
    `;
    div.querySelector('.delete').addEventListener('click', async () => {
      if (confirm('Delete project?')) {
        const { error } = await supabase.from('projects').delete().eq('id', proj.id);
        if (error) return showToast('Delete failed', 'error');
        loadProjects();
      }
    });
    projectsContainer.appendChild(div);
  });
}

loadProjects();
