/* ============================================================
   Theme toggle
   ============================================================ */
const THEME_KEY = 'jy-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll('.theme-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function initTheme() {
  var saved = localStorage.getItem(THEME_KEY) || 'system';
  applyTheme(saved);
}

document.querySelectorAll('.theme-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    applyTheme(btn.dataset.theme);
  });
});

initTheme();

/* ============================================================
   SPA navigation — keep nav persistent, load post content
   ============================================================ */
var contentArea = document.getElementById('content-area');

function setActiveLink(url) {
  document.querySelectorAll('.post-entry').forEach(function (entry) {
    var link = entry.querySelector('.post-link');
    if (link) {
      entry.classList.toggle('active', link.dataset.url === url);
    }
  });
}

function showLoading() {
  contentArea.innerHTML = '<div class="content-loading">Loading…</div>';
}

function loadContent(url) {
  showLoading();

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text();
    })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var incoming = doc.getElementById('content-area');
      if (incoming) {
        contentArea.innerHTML = incoming.innerHTML;
      } else {
        // Fallback: show full page
        window.location.href = url;
      }
      contentArea.scrollTop = 0;
      setActiveLink(url);
      history.pushState({ url: url }, doc.title || '', url);
      document.title = doc.title || 'JY notes';
    })
    .catch(function () {
      // On any fetch failure, do a regular navigation
      window.location.href = url;
    });
}

// Intercept nav clicks
document.querySelector('.nav-rail').addEventListener('click', function (e) {
  var link = e.target.closest('[data-url]');
  if (!link) return;
  var url = link.dataset.url;
  if (!url) return;
  e.preventDefault();
  if (url === window.location.pathname) return; // already here
  loadContent(url);
});

// Handle browser back/forward
window.addEventListener('popstate', function (e) {
  var url = (e.state && e.state.url) || window.location.pathname;
  showLoading();

  fetch(url)
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var incoming = doc.getElementById('content-area');
      if (incoming) {
        contentArea.innerHTML = incoming.innerHTML;
      }
      contentArea.scrollTop = 0;
      setActiveLink(url);
      document.title = doc.title || 'JY notes';
    })
    .catch(function () {
      window.location.href = url;
    });
});

// Mark the initial active item on page load
setActiveLink(window.location.pathname);

// Seed initial history state so popstate fires correctly on first back
history.replaceState({ url: window.location.pathname }, document.title, window.location.pathname);
