// Keep native details semantics and progressively enhance both directions.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const transitions = new Map();
const number = value => Number.parseFloat(value) || 0;
const content = details => [...details.children].filter(child => child.tagName !== 'SUMMARY');

function collapsedHeight(details) {
  const summary = details.querySelector(':scope > summary');
  const box = getComputedStyle(details);
  const label = getComputedStyle(summary);
  return summary.getBoundingClientRect().height + number(label.marginTop) + number(label.marginBottom)
    + number(box.paddingTop) + number(box.paddingBottom) + number(box.borderTopWidth) + number(box.borderBottomWidth);
}

function cleanup(details, state) {
  state.height?.cancel();
  state.reveals.forEach(animation => animation.cancel());
  details.style.overflow = state.overflow;
  details.style.boxSizing = state.boxSizing;
  if (transitions.get(details) === state) transitions.delete(details);
}

function transition(details, opening, startHeight) {
  const previous = transitions.get(details);
  const from = startHeight ?? details.getBoundingClientRect().height;
  const currentContent = new Map(content(details).map(child => {
    const style = getComputedStyle(child);
    return [child, { opacity: style.opacity, translate: style.translate }];
  }));
  // Read the current animated height before cancelling a reversed transition.
  const overflow = previous?.overflow ?? details.style.overflow;
  const boxSizing = previous?.boxSizing ?? details.style.boxSizing;
  if (previous) cleanup(details, previous);
  const state = { opening, overflow, boxSizing, nativeOpen: details.open || opening, reveals: [], height: undefined };
  transitions.set(details, state);
  if (opening) details.open = true;
  if (reducedMotion.matches || !details.animate) {
    details.open = opening;
    cleanup(details, state);
    return;
  }
  const to = opening ? details.getBoundingClientRect().height : collapsedHeight(details);
  details.style.overflow = 'hidden';
  details.style.boxSizing = 'border-box';
  state.height = details.animate([{ height: `${from}px` }, { height: `${to}px` }], {
    duration: opening ? 440 : 320, easing: 'cubic-bezier(.22,.68,.2,1)', fill: 'both'
  });
  for (const child of content(details)) {
    state.reveals.push(child.animate(opening ? [
      previous ? currentContent.get(child) : { opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }
    ] : [currentContent.get(child), { opacity: 0 }], {
      duration: opening ? 360 : 180, delay: opening ? 70 : 0, easing: 'ease-out', fill: 'both'
    }));
  }
  state.height.finished.then(() => {
    if (transitions.get(details) !== state) return;
    details.open = opening;
    cleanup(details, state);
  }).catch(() => {});
}

// A native summary click is also dispatched by Enter and Space.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  const target = event.target instanceof Element ? event.target : null;
  const summary = target?.closest('summary');
  const details = summary?.parentElement;
  if (!(details instanceof HTMLDetailsElement) || target.closest('a,button,input,select,textarea,[contenteditable]')) return;
  if (details.querySelector(':scope > summary') !== summary || reducedMotion.matches || !details.animate) return;
  event.preventDefault();
  const opening = transitions.has(details) ? !transitions.get(details).opening : !details.open;
  transition(details, opening);
});

// Also support disclosures toggled by other scripts, including named groups.
document.addEventListener('toggle', event => {
  const details = event.target;
  if (!(details instanceof HTMLDetailsElement)) return;
  if (!details.querySelector(':scope > summary')) return;
  const state = transitions.get(details);
  if (state && details.open === state.nativeOpen) return;
  if (state) cleanup(details, state);
  if (details.open && !reducedMotion.matches && details.animate) transition(details, true, collapsedHeight(details));
}, true);

// Lazy media can change the destination height while a panel is expanding.
document.addEventListener('load', event => {
  if (!(event.target instanceof HTMLImageElement)) return;
  const details = event.target.closest('details');
  if (transitions.get(details)?.opening) transition(details, true);
}, true);

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  for (const [details, state] of transitions) {
    details.open = state.opening;
    cleanup(details, state);
  }
});
addEventListener('resize', () => {
  // End at natural height rather than retaining a stale desktop measurement.
  for (const [details, state] of transitions) {
    details.open = state.opening;
    cleanup(details, state);
  }
});
