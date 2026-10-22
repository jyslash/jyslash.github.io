// View modes inside one page: About (Highlight ↔ Everything) and Projects
// (Selected works ↔ Everything). PRD §6.3.
//
// Markup:
//   <div data-views data-view="highlight">
//     <button data-view-switch="highlight">…</button>
//     <button data-view-switch="everything">…</button>
//     <div data-show-in="highlight">…</div>      hidden unless that view is active
//     <li data-vt="journal-2026-…">…</li>        same key in both views = morphs
//   </div>
//
// The switch runs inside a view transition. Elements with the same `data-vt`
// key in the old and new view get the same view-transition-name, so the
// browser morphs one into the other; the rest fade. Only on-screen elements
// are named, which keeps it smooth for long lists. The active view is kept in
// ?view= so it can be linked to.

var MAX_NAMED = 80;
var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function onScreen(el) {
  var r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

function nameVisible(root) {
  var named = 0;
  root.querySelectorAll('[data-vt]').forEach(function (el) {
    if (named < MAX_NAMED && onScreen(el)) {
      el.style.viewTransitionName = 'vt-' + el.dataset.vt.replace(/[^a-zA-Z0-9_-]/g, '_');
      named++;
    } else {
      el.style.viewTransitionName = '';
    }
  });
}

function clearNames(root) {
  root.querySelectorAll('[data-vt]').forEach(function (el) { el.style.viewTransitionName = ''; });
}

function apply(root, view) {
  root.dataset.view = view;
  root.querySelectorAll('[data-view-switch]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.dataset.viewSwitch === view));
  });
}

function rememberInUrl(root, view) {
  var url = new URL(location.href);
  if (view === root.dataset.defaultView) url.searchParams.delete('view');
  else url.searchParams.set('view', view);
  history.replaceState(history.state, '', url);
}

function setView(root, view) {
  if (root.dataset.view === view) return;
  rememberInUrl(root, view);
  if (!document.startViewTransition || reducedMotion.matches) {
    apply(root, view);
    return;
  }
  root.classList.add('is-switching');
  nameVisible(root);
  var transition = document.startViewTransition(function () {
    apply(root, view);
    nameVisible(root);
  });
  transition.finished.finally(function () {
    clearNames(root);
    root.classList.remove('is-switching');
  });
}

document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-view-switch]');
  if (!btn) return;
  var root = btn.closest('[data-views]');
  if (root) setView(root, btn.dataset.viewSwitch);
});

// Restore ?view= on load, without animation.
document.addEventListener('astro:page-load', function () {
  var view = new URL(location.href).searchParams.get('view');
  document.querySelectorAll('[data-views]').forEach(function (root) {
    root.dataset.defaultView = root.dataset.view;
    var valid = root.querySelector('[data-view-switch="' + view + '"]');
    apply(root, valid ? view : root.dataset.view);
  });
});
