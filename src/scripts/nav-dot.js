document.addEventListener('DOMContentLoaded', () => {
    const navs = document.querySelectorAll('.main-nav');
    const sections = document.querySelectorAll('section[id]');
    const path = window.location.pathname;

    // Відповідність URL -> пункт меню
    const routeMap = [
        { key: '/projects/', selector: '#selected-projects' },
        { key: '/articles', selector: '.nav-blog' },
        // Сюди легко додати нові (наприклад: { key: '/contacts', selector: '#contacts' })
    ];

    navs.forEach(nav => {
        const dot = nav.querySelector('.nav-dot');
        const links = nav.querySelectorAll('.nav-link');
        let activeLink = null;

        function moveDotTo(element) {
            if (!dot || !element || !element.offsetParent) return;
            const rect = element.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            const left = rect.left - navRect.left + rect.width / 2 - dot.offsetWidth / 2;
            dot.style.left = `${left}px`;
        }

        // --- Hover (не змінює активний)
        links.forEach(link => {
            link.addEventListener('mouseenter', () => moveDotTo(link));
            link.addEventListener('click', () => {
                setTimeout(() => moveDotTo(link), 100);
            });
        });

        nav.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                if (activeLink) moveDotTo(activeLink);
            });
        });

        // --- Перевіряємо, чи підпадає шлях під спец-сторінки
        const route = routeMap.find(r => path.includes(r.key));
        if (route) {
            const link = nav.querySelector(`[href*="${route.selector}"], ${route.selector}`);
            if (link) {
                link.classList.add('active');
                activeLink = link;
                requestAnimationFrame(() => moveDotTo(link));
            }
            return; // Виходимо — Observer не потрібен
        }

        // --- Якщо звичайна головна сторінка: Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const matchingLink = Array.from(links).find(link => {
                        const href = link.getAttribute('href') || '';
                        return href.endsWith(`#${id}`);
                    });
                    if (matchingLink && matchingLink !== activeLink) {
                        activeLink?.classList.remove('active');
                        matchingLink.classList.add('active');
                        activeLink = matchingLink;
                        moveDotTo(matchingLink);
                    }
                }
            });
        }, {
            threshold: 0.4,
            rootMargin: '0px 0px -30% 0px'
        });

        sections.forEach(section => observer.observe(section));

        // --- При завантаженні
        window.addEventListener('load', () => {
            const hash = decodeURIComponent(location.hash);
            const current = Array.from(links).find(link => link.getAttribute('href')?.endsWith(hash));
            const fallback = links[0];
            const initial = current || fallback;

            initial.classList.add('active');
            activeLink = initial;
            requestAnimationFrame(() => moveDotTo(initial));
        });

        window.addEventListener('resize', () => {
            if (activeLink) moveDotTo(activeLink);
        });
    });
});