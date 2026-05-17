/** Lightweight rich text (Quill) for admin block modals. */

const editors = new WeakMap();

function loadQuill() {
  if (window.Quill) return Promise.resolve(window.Quill);
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-quill]')) {
      const wait = setInterval(() => {
        if (window.Quill) {
          clearInterval(wait);
          resolve(window.Quill);
        }
      }, 50);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js';
    script.dataset.quill = 'true';
    script.onload = () => resolve(window.Quill);
    script.onerror = () => reject(new Error('Failed to load editor'));
    document.head.appendChild(script);
  });
}

export async function mountRichText(textarea) {
  if (!textarea || editors.has(textarea)) return editors.get(textarea);

  const Quill = await loadQuill();
  const wrap = document.createElement('div');
  wrap.className = 'admin-rich-text__editor';
  textarea.classList.add('hidden');
  textarea.parentNode.insertBefore(wrap, textarea.nextSibling);

  const quill = new Quill(wrap, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline', 'link'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    },
  });

  if (textarea.value) {
    quill.clipboard.dangerouslyPasteHTML(textarea.value);
  }

  quill.on('text-change', () => {
    textarea.value = quill.root.innerHTML;
  });

  editors.set(textarea, quill);
  return quill;
}

export async function mountRichTextInForm(form) {
  const fields = form?.querySelectorAll('textarea[data-rich-text]') ?? [];
  await Promise.all([...fields].map((ta) => mountRichText(ta)));
}

export function setRichTextValue(form, name, html) {
  const textarea = form?.querySelector(`textarea[name="${name}"]`);
  if (!textarea) return;
  textarea.value = html || '';
  const quill = editors.get(textarea);
  if (quill) {
    quill.root.innerHTML = html || '';
  }
}

export function syncRichTextFromForm(form) {
  form?.querySelectorAll('textarea[data-rich-text]').forEach((textarea) => {
    const quill = editors.get(textarea);
    if (quill) textarea.value = quill.root.innerHTML;
  });
}

export function destroyRichTextInForm(form) {
  form?.querySelectorAll('textarea[data-rich-text]').forEach((textarea) => {
    const quill = editors.get(textarea);
    const wrap = quill?.root?.parentElement;
    if (wrap?.classList.contains('ql-container')) {
      wrap.parentElement?.remove();
    }
    textarea.classList.remove('hidden');
    editors.delete(textarea);
  });
}
