import { projectCardMarkup } from '../lib/project-cards.js?v=20261117-cards1';
const btn = document.getElementById('load-more');
const grid = document.getElementById('projects-grid');
const lang = document.documentElement.lang;

function buildProjectCard(project) {
  const template=document.createElement('template');
  template.innerHTML=projectCardMarkup(project);
  return template.content.firstElementChild;
}

if (btn) {
  let offset = grid.querySelectorAll('.project-card').length;
  const limit = 3;

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

      newProjects.forEach((p) => {
        if (!p.title) return;
        const card = buildProjectCard(p);
        grid.appendChild(card);
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
      btn.disabled = false;
    }
  });
}
