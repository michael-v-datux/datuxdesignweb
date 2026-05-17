(function initRedirectSplash() {
  const configEl = document.getElementById('redirect-config');
  if (!configEl?.textContent) return;

  let config;
  try {
    config = JSON.parse(configEl.textContent);
  } catch {
    return;
  }

  const messages = config.messages?.length ? config.messages : ['Loading…'];
  const defaultLang = config.defaultLang || 'en';
  const redirectScreen = document.getElementById('redirect-screen');
  const textEl = document.getElementById('redirect-text');
  const bar = document.querySelector('.loader-fill');

  if (!redirectScreen || !textEl || !bar) return;

  const MESSAGE_INTERVAL_MS = 1100;
  const MIN_SHOW_MS = MESSAGE_INTERVAL_MS * messages.length;
  const EXIT_FADE_MS = 500;

  let msgIndex = 0;
  textEl.textContent = messages[0];

  bar.style.width = '0%';
  requestAnimationFrame(() => {
    redirectScreen.classList.add('loaded');
    requestAnimationFrame(() => {
      bar.style.width = '100%';
    });
  });

  const messageTimer = setInterval(() => {
    msgIndex = (msgIndex + 1) % messages.length;
    textEl.classList.add('is-changing');
    setTimeout(() => {
      textEl.textContent = messages[msgIndex];
      textEl.classList.remove('is-changing');
    }, 180);
  }, MESSAGE_INTERVAL_MS);

  const targetLang =
    (typeof localStorage !== 'undefined' && localStorage.getItem('preferredLanguage')) ||
    defaultLang;

  setTimeout(() => {
    clearInterval(messageTimer);
    redirectScreen.classList.add('is-exiting');
    try {
      sessionStorage.setItem('pageRevealPending', '1');
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      window.location.href = `/${targetLang}/`;
    }, EXIT_FADE_MS);
  }, MIN_SHOW_MS);
})();
