document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('project-content');
  const loader = document.getElementById('project-loader');
  const passwordFormContainer = document.getElementById('project-password-container');
  const section = document.getElementById('project-page');

  const slug = section.dataset.slug;
  const lang = section.dataset.lang;

  try {
    const res = await fetch(`/api/projects/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: '' }) // спершу пробуємо без пароля
    });

    const data = await res.json();

    if (res.status === 401 && data.error === 'Unauthorized') {
      // проект захищений — показуємо форму
      loader.classList.add('hidden');
      passwordFormContainer.classList.remove('hidden');
      return;
    }

    if (!res.ok) throw new Error('Failed to load project');

    loader.classList.add('hidden');
    container.classList.remove('hidden');

    // Рендер контенту
    container.innerHTML = `
      <header class="mb-12">
        <h1 class="text-4xl font-bold mb-4">${data.title}</h1>
        ${data.subtitle ? `<p class="text-lg text-neutral-600">${data.subtitle}</p>` : ''}
      </header>
      ${data.blocks.map(block => `
        <section class="grid gap-6 ${block.columns_count === 1 ? 'grid-cols-1' : block.columns_count === 2 ? 'grid-cols-2' : 'grid-cols-3'}">
          ${(block.data?.columns || []).map(col => `
            <div class="flex flex-col">
              ${col.image ? `
                <div class="relative">
                  <img src="${col.image.url}" class="${block.columns_count === 1 ? 'h-[50vh] object-cover w-full' : 'h-auto w-full'}" />
                  ${col.image.tooltip ? `<div class="absolute bottom-2 left-2 bg-black/60 text-white p-2 text-sm rounded">${col.image.tooltip[lang]}</div>` : ''}
                </div>` : ''}
              ${col.text && col.text[lang] ? `<div class="mt-4 prose max-w-none">${col.text[lang]}</div>` : ''}
            </div>
          `).join('')}
        </section>
      `).join('')}
    `;
  } catch (e) {
    loader.innerHTML = `<p class="text-red-500">Error loading project</p>`;
  }
});
