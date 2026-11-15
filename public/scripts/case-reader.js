/** A reading aid, with real anchors as the no-JS fallback. */
export function initCaseReader(root = document) {
  root.querySelectorAll('[data-case-reader]').forEach(nav => {
    if (nav.dataset.ready) return;
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
    if (chapters.some(chapter => !chapter)) return;
    nav.dataset.ready = 'true';
    let queued = false;
    let previous = -1;
    const update = () => {
      queued = false;
      const siteBar = [...document.querySelectorAll('#sticky-navbar, #sticky-mobile-bar')].find(bar => bar.classList.contains('is-revealed') && getComputedStyle(bar).display !== 'none');
      nav.style.setProperty('--reader-top', `${siteBar ? siteBar.getBoundingClientRect().height : 0}px`);
      // Match section scroll-margin, so a chapter selected by its link is active on arrival.
      const threshold = Math.max(180, nav.getBoundingClientRect().bottom + 100);
      let active = 0;
      chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top <= threshold) active = index; });
      links.forEach((link, index) => { if (index === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      if (previous !== active) {
        const rail = nav.querySelector('.case-reader__links');
        if (rail && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: links[active].offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + links[active].offsetWidth / 2, behavior: 'auto' });
        previous = active;
      }
      const position = nav.querySelector('[data-case-reader-position]');
      if (position) position.textContent = String(active + 1).padStart(2, '0');
      const content = nav.closest('.case-study');
      const rect = content.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      nav.style.setProperty('--read-progress', String(progress));
    };
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    update();
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initCaseReader(), { once: true });
  else initCaseReader();
}
