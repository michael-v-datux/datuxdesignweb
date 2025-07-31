document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenuWrapper = document.getElementById('mobile-menu-wrapper');
    const mobileMenu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('menu-backdrop');
    const menuLines = menuToggle.querySelectorAll('span');
    const body = document.body;

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

    const openMenu = () => {
        mobileMenuWrapper.classList.remove('hidden');
        requestAnimationFrame(() => {
            mobileMenu.classList.add('open');
        });
        body.classList.add('overflow-hidden');

        menuLines[0].classList.add('rotate-45', 'translate-y-2');
        menuLines[1].classList.add('opacity-0');
        menuLines[2].classList.add('-rotate-45', '-translate-y-2');
    };

    const closeMenu = () => {
        mobileMenu.classList.remove('open');
        setTimeout(() => mobileMenuWrapper.classList.add('hidden'), 300);
        body.classList.remove('overflow-hidden');

        menuLines[0].classList.remove('rotate-45', 'translate-y-2');
        menuLines[1].classList.remove('opacity-0');
        menuLines[2].classList.remove('-rotate-45', '-translate-y-2');
    };

    menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        isOpen ? closeMenu() : openMenu();
    });

    backdrop.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    // Закриваємо при кліку по пустій області меню
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) { // клік не по лінку чи вкладеному елементу
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 640) closeMenu();
    });
});