(function initPageEnterReveal() {
  let pending = false;
  try {
    pending = sessionStorage.getItem('pageRevealPending') === '1';
    if (pending) sessionStorage.removeItem('pageRevealPending');
  } catch {
    return;
  }

  if (!pending) return;

  const veil = document.createElement('motion');
  veil.id = 'page-enter-veil';
  veil.className = 'page-enter-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      veil.classList.add('is-revealing');
    });
  });

  const cleanup = () => veil.remove();
  veil.addEventListener('transitionend', cleanup, { once: true });
  setTimeout(cleanup, 1200);
})();
