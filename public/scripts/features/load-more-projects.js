const btn = document.getElementById('load-more');
const grid = document.getElementById('projects-grid');
const lang = document.documentElement.lang;

if (btn) {
    let offset = 3;
    const limit = 3;

    // Показуємо стартові картки з анімацією
    document.querySelectorAll('.project-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 100);
    });

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Loading...';

        try {
            const res = await fetch(`/api/load-projects?offset=${offset}&limit=${limit}&lang=${lang}`);
            if (!res.ok) throw new Error('Failed to load');
            const newProjects = await res.json();

            newProjects.forEach((p, index) => {
                const a = document.createElement('a');
                a.href = `/${p.lang}/projects/${p.slug}`;
                a.className = "project-card group block w-full h-[300px] border border-neutral-200 rounded-xl px-6 text-center relative overflow-hidden transition-colors hover:bg-neutral-100 mx-auto flex flex-col items-center justify-center opacity-0 translate-y-4";
                a.innerHTML = `
                    <span class="block text-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm mb-1">
                      ${p.category}
                    </span>
                    <span class="text-lg font-medium text-neutral-800">${p.title}</span>
                `;
                grid.appendChild(a);

                // Анімація появи
                setTimeout(() => a.classList.add('visible'), 100 * index);
            });

            offset += newProjects.length;
            if (newProjects.length < limit) {
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