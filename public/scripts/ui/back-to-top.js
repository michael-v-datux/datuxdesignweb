import { CASE_THEMES } from '/scripts/lib/case-design.js?v=20261115-explorer1';

function initBackToTop() {
  const button = document.querySelector('[data-back-to-top]');
  const top = document.getElementById('page-top');
  if (!button || !top || button.dataset.ready) return;
  button.dataset.ready = 'true';
  const caseRoot = document.querySelector('.case-study');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const obstructions = [document.getElementById('cookie-banner'), document.querySelector('[data-admin-link]')].filter(Boolean);
  let visible = false, queued = false, focusOnArrival = false;
  const update = () => {
    queued = false;
    const theme = CASE_THEMES.find(name => caseRoot?.classList.contains(`case-theme--${name}`));
    button.dataset.theme = theme || 'classic';
    const threshold = Math.max(640, innerHeight * .85);
    const blocked = !!document.querySelector('dialog[open], #mobile-menu.open') || getComputedStyle(document.body).overflow === 'hidden';
    const canScroll = document.documentElement.scrollHeight - innerHeight > threshold;
    visible = !blocked && canScroll && scrollY > (visible ? threshold * .55 : threshold);
    button.hidden = !visible;
    let bottom = 24;
    const rightEdge = innerWidth - 160;
    for (const element of obstructions) {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (!element.hidden && style.display !== 'none' && style.visibility !== 'hidden' && rect.width && rect.height && rect.top < innerHeight && rect.bottom > 0 && rect.right > rightEdge) bottom = Math.max(bottom, innerHeight - rect.top + 12);
    }
    button.style.setProperty('--back-top-bottom', `${Math.ceil(bottom)}px`);
    if (focusOnArrival && scrollY <= 1) {
      focusOnArrival = false;
      top.focus({ preventScroll: true });
    }
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  button.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    focusOnArrival = event.detail === 0;
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    schedule();
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  const observer = new MutationObserver(schedule);
  [document.body, caseRoot, ...obstructions, document.getElementById('mobile-menu'), ...document.querySelectorAll('dialog')].filter(Boolean).forEach(element => observer.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open'] }));
  obstructions.forEach(element => element.addEventListener('transitionend', schedule));
  if (typeof ResizeObserver !== 'undefined') {
    const resize = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) resize.observe(main);
    obstructions.forEach(element => resize.observe(element));
  }
  update();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBackToTop, { once: true });
else initBackToTop();
