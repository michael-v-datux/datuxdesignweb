/** Small case-study interactions; source material remains readable without JS. */
function initSystemCase() {
  document.querySelectorAll('[data-system-inspector]').forEach(root => {
    if (root.dataset.ready) return;
    root.dataset.ready = 'true';
    const controls = [...root.querySelectorAll('[data-specimen-state]')];
    controls.forEach(control => control.addEventListener('click', () => {
      const state = control.dataset.specimenState;
      root.dataset.state = state;
      controls.forEach(button => button.setAttribute('aria-pressed', String(button === control)));
      root.querySelectorAll('[data-specimen] button').forEach(button => { button.disabled = state === 'disabled'; });
      const description = root.querySelector('[data-specimen-description]');
      if (description) description.textContent = control.dataset.description;
    }));
  });
  document.querySelectorAll('[data-motion-src]').forEach(img => {
    const control = img.closest('figure')?.querySelector('[data-motion-toggle]');
    if (!control || !img.dataset.motionPoster) return;
    let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = () => {
      img.src = paused ? img.dataset.motionPoster : img.dataset.motionSrc;
      control.textContent = paused ? control.dataset.playLabel : control.dataset.pauseLabel;
      control.setAttribute('aria-pressed', String(paused));
    };
    update();
    control.addEventListener('click', () => { paused = !paused; update(); });
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSystemCase, { once: true });
else initSystemCase();
