// /public/scripts/features/load-more-projects.js
const btn = document.getElementById('load-more');
const grid = document.getElementById('projects-grid');

if (btn) {
    let offset = 3;
    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Loading...';

        try {
            const res = await fetch(`/api/load-projects?offset=${offset}&limit=3`);
            if (!res.ok) throw new Error('Failed to load');
            const newProjects = await res.json();

            newProjects.forEach((p) => {
                const a = document.createElement('a');
                a.href = `/${p.lang}/projects/${p.slug}`;
                a.className = "group block w-full h-[300px] border border-neutral-200 rounded-xl px-6 text-center relative overflow-hidden transition-colors hover:bg-neutral-100 mx-auto flex items-center justify-center";
                a.innerHTML = `
                    <div class="relative flex flex-col items-center justify-center transition-all duration-300">
                      <div class="text-lg font-medium text-neutral-800 mb-0 group-hover:mb-2 transition-all duration-300">
                        <span class="block text-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          ${p.category}
                        </span>
                        ${p.title}
                      </div>
                    </div>
                `;
                grid.appendChild(a);
            });

            offset += newProjects.length;
            if (newProjects.length < 3) {
                btn.remove();
            } else {
                btn.disabled = false;
                btn.textContent = 'Load more';
            }
        } catch (e) {
            console.error(e);
            btn.textContent = 'Error';
        }
    });
}
