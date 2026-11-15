(() => {
  const link = document.querySelector('[data-admin-link]');
  if (!link) return;
  async function update() {
    link.hidden = true;
    try {
      const response = await fetch('/api/admin-session', { credentials: 'same-origin', cache: 'no-store' });
      if (response.ok) link.hidden = !(await response.json()).authenticated;
    } catch { /* Keep the shortcut hidden if session verification fails. */ }
  }
  window.addEventListener('pageshow', (event) => { if (event.persisted) update(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') update();
  });
  update();
})();
