const btn = document.getElementById('load-more');
const grid = document.getElementById('projects-grid');
const lang = document.documentElement.lang;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildProjectCard(p) {
  const a = document.createElement('a');
  a.href = `/${p.lang}/projects/${encodeURIComponent(p.slug)}`;
  a.className =
    'project-card group block w-full h-[300px] border border-neutral-200 rounded-xl relative overflow-hidden mx-auto opacity-0 translate-y-4';

  const title = escapeHtml(p.title);
  const category = p.category ? escapeHtml(p.category) : '';
  const thumbnail = p.thumbnail ? escapeHtml(p.thumbnail) : '';

  if (thumbnail) {
    a.classList.add('project-card--image');
    const categoryHtml = category
      ? `<span class="category">${category}</span>`
      : '';
    a.innerHTML = `
      <img src="${thumbnail}" alt="" class="project-card__img" loading="lazy" decoding="async" />
      <div class="project-card__overlay">
        ${categoryHtml}
        <span class="title">${title}</span>
      </div>
    `;
  } else {
    a.classList.add('project-card--text');
    const categoryHtml = category
      ? `<span class="category">${category}</span>`
      : '';
    a.innerHTML = `
      <div class="project-card__body">
        ${categoryHtml}
        <span class="title">${title}</span>
      </div>
    `;
  }

  return a;
}

if (btn) {
  let offset = 3;
  const limit = 3;

  document.querySelectorAll('.project-card').forEach((card, i) => {
    setTimeout(() => card.classList.add('visible'), i * 100);
  });

  const labelLoadMore = btn.dataset.labelLoadMore || 'Load more';
  const labelLoading = btn.dataset.labelLoading || 'Loading...';
  const labelError = btn.dataset.labelError || 'Error';

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = labelLoading;

    try {
      const res = await fetch(`/api/load-projects?offset=${offset}&limit=${limit}&lang=${lang}`);
      if (!res.ok) throw new Error('Failed to load');
      const newProjects = await res.json();

      newProjects.forEach((p, index) => {
        if (!p.title) return;
        const card = buildProjectCard(p);
        grid.appendChild(card);
        setTimeout(() => card.classList.add('visible'), 100 * index);
      });

      offset += newProjects.length;
      if (newProjects.length < limit) {
        btn.remove();
      } else {
        btn.disabled = false;
        btn.textContent = labelLoadMore;
      }
    } catch (e) {
      console.error(e);
      btn.textContent = labelError;
    }
  });
}
