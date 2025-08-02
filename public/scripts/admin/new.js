import { supabase } from '/src/lib/supabaseClient.js';
import { showToast } from '/js/common/toast.js';

const form = document.getElementById('new-project-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const newProject = {
    title_en: formData.get('title_en'),
    title_uk: formData.get('title_uk'),
    description_en: formData.get('description_en'),
    description_uk: formData.get('description_uk'),
    thumbnail: formData.get('thumbnail'),
    is_protected: formData.get('is_protected') === 'on',
    password: formData.get('password'),
    status: formData.get('status')
  };

  const { error } = await supabase.from('projects').insert([newProject]);
  if (error) return showToast('Failed to create project', 'error');

  showToast('Project created!');
  form.reset();
  window.location.href = '/admin/dashboard';
});
