(() => {
  const dialog = document.querySelector('[data-case-lightbox]');
  const triggers = [...document.querySelectorAll('.case-study [data-case-image]')];
  if (!dialog || !triggers.length) return;
  const picture = dialog.querySelector('[data-lightbox-image]');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  const stage = dialog.querySelector('[data-lightbox-stage]');
  const zoom = dialog.querySelector('[data-lightbox-zoom]');
  let index = 0;
  let previousOverflow = '';
  let returnFocus;
  function resetZoom() {
    dialog.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = zoom.dataset.zoomLabel;
    stage.scrollTo(0, 0);
  }
  function show(next) {
    index = (next + triggers.length) % triggers.length;
    const trigger = triggers[index];
    resetZoom();
    picture.src = trigger.dataset.imageSrc;
    picture.alt = trigger.querySelector('img')?.alt || '';
    caption.textContent = trigger.dataset.imageCaption || picture.alt;
    dialog.querySelector('[data-lightbox-count]').textContent = `${index + 1} / ${triggers.length}`;
    dialog.querySelector('[data-lightbox-original]').href = picture.src;
    dialog.querySelector('[data-lightbox-prev]').disabled = triggers.length < 2;
    dialog.querySelector('[data-lightbox-next]').disabled = triggers.length < 2;
  }
  triggers.forEach((trigger, i) => trigger.addEventListener('click', () => {
    if (dialog.open) return;
    returnFocus = trigger;
    previousOverflow = document.body.style.overflow;
    show(i);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('[data-lightbox-close]').focus();
  }));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  zoom.addEventListener('click', () => {
    const active = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(active));
    zoom.textContent = active ? zoom.dataset.fitLabel : zoom.dataset.zoomLabel;
    stage.scrollTo(0, 0);
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    picture.removeAttribute('src');
    returnFocus?.focus({ preventScroll: true });
  });
})();
