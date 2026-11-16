// Native disclosure behavior stays intact; only the revealed content is animated.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new WeakMap();
const active = new Set();
const pendingImages = new WeakSet();

function reveal(element) {
  animations.get(element)?.cancel();
  if (reducedMotion.matches || !element.animate) return;
  const animation = element.animate([
    { opacity: 0, translate: '0 8px' },
    { opacity: 1, translate: '0 0' }
  ], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
  animations.set(element, animation);
  active.add(animation);
  animation.finished.catch(() => {}).finally(() => active.delete(animation));
}

document.addEventListener('toggle', event => {
  const details = event.target;
  if (!(details instanceof HTMLDetailsElement)) return;
  for (const child of details.children) {
    if (child.tagName === 'SUMMARY') continue;
    animations.get(child)?.cancel();
    if (details.open) reveal(child);
  }
  if (!details.open || reducedMotion.matches) return;
  // A lazy image can arrive after the disclosure animation has finished.
  details.querySelectorAll('img').forEach(image => {
    if (image.complete || pendingImages.has(image)) return;
    pendingImages.add(image);
    image.addEventListener('load', () => {
      pendingImages.delete(image);
      if (details.open && !reducedMotion.matches) reveal(image);
    }, { once: true });
    image.addEventListener('error', () => pendingImages.delete(image), { once: true });
  });
}, true);

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) active.forEach(animation => animation.cancel());
});
