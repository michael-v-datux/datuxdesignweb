document.addEventListener('DOMContentLoaded', () => {
    const menuToggles = document.querySelectorAll('.js-menu-toggle');
    const mobileMenuWrapper = document.getElementById('mobile-menu-wrapper');
    const mobileMenu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('menu-backdrop');
    const body = document.body;

    if (!menuToggles.length || !mobileMenuWrapper || !mobileMenu || !backdrop) return;

    const scrollToTopLinks = document.querySelectorAll('#scroll-to-top');

    scrollToTopLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const currentLang = document.documentElement.lang || 'en';
            const isOnHome = window.location.pathname === `/${currentLang}/`;
            const isHashHello = link.getAttribute('href')?.endsWith('#hello');

            if (!isOnHome) {
                e.preventDefault();
                window.location.href = `/${currentLang}/#hello`;
                return;
            }

            if (isHashHello) {
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }
        });
    });

    const setTogglesOpen = (open) => {
        menuToggles.forEach((toggle) => {
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    };

    const openMenu = () => {
        setTogglesOpen(true);
        mobileMenuWrapper.classList.remove('hidden');
        requestAnimationFrame(() => {
            mobileMenu.classList.add('open');
        });
        body.classList.add('overflow-hidden');
    };

    const closeMenu = () => {
        setTogglesOpen(false);
        mobileMenu.classList.remove('open');
        setTimeout(() => mobileMenuWrapper.classList.add('hidden'), 300);
        body.classList.remove('overflow-hidden');
    };

    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.contains('open');
        isOpen ? closeMenu() : openMenu();
    };

    menuToggles.forEach((toggle) => {
        toggle.addEventListener('click', toggleMenu);
        toggle.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            toggleMenu();
        });
    });

    backdrop.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 640) closeMenu();
    });
});
