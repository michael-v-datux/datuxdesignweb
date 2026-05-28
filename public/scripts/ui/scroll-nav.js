const stickyNavbar = document.getElementById('sticky-navbar');
const stickyMobileBar = document.getElementById('sticky-mobile-bar');
const regularNavbar = document.getElementById('navbar');

const NEAR_TOP_PX = 100;
const SCROLL_DELTA = 10;

if (regularNavbar && (stickyNavbar || stickyMobileBar)) {
  let lastScrollY = window.scrollY;
  let scrollingUp = true;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateStickyBars = () => {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;

    if (Math.abs(delta) >= SCROLL_DELTA) {
      scrollingUp = delta < 0;
    }

    const nearTop = scrollY <= NEAR_TOP_PX;
    const pinned = regularNavbar.getBoundingClientRect().bottom <= 0;
    const reducedMotion = reducedMotionQuery.matches;
    const revealed = pinned && (nearTop || scrollingUp || reducedMotion);

    [stickyNavbar, stickyMobileBar].forEach((bar) => {
      if (!bar) return;
      bar.classList.toggle('is-pinned', pinned);
      bar.classList.toggle('is-revealed', revealed);
      bar.setAttribute('aria-hidden', pinned && revealed ? 'false' : 'true');
    });

    lastScrollY = scrollY;
  };

  updateStickyBars();
  window.addEventListener('scroll', updateStickyBars, { passive: true });
  window.addEventListener('resize', updateStickyBars);
  reducedMotionQuery.addEventListener('change', updateStickyBars);
}
