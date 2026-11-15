/** Progressive enhancement: without JS all source screens remain visible. */
export function initCaseStates(root = document) {
  root.querySelectorAll('[data-case-states]').forEach(section => {
    if (section.dataset.statesReady) return;
    const tabs = [...section.querySelectorAll('[data-state-select]')];
    const panels = [...section.querySelectorAll('[data-state-panel]')];
    const list = section.querySelector('[role="tablist"]');
    if (tabs.length < 2 || tabs.length !== panels.length || !list) return;
    const select = (active, focus = false) => {
      tabs.forEach((tab, index) => {
        tab.setAttribute('aria-selected', String(index === active));
        tab.tabIndex = index === active ? 0 : -1;
        panels[index].hidden = index !== active;
      });
      if (focus) tabs[active].focus();
    };
    panels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.tabIndex = 0;
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
    section.dataset.statesReady = 'true';
    section.classList.add('is-enhanced');
    list.hidden = false;
    select(0);
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initCaseStates(), { once: true });
  else initCaseStates();
}
