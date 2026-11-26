(() => {
  'use strict';
  const directory = document.querySelector('.quick-nav details');
  const compact = window.matchMedia('(max-width: 1279px)');
  if (directory && compact.matches) directory.open = false;
  if (directory) directory.addEventListener('click', event => {
    if (event.target.closest('a') && compact.matches) directory.open = false;
  });
  if (document.body.dataset.topicReader !== 'true') return;
  function revealFragment() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (let parent = target; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', revealFragment);
  if (location.hash) revealFragment();
})();
