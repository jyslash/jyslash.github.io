/* ============================================================
   Theme — persist across sessions
   ============================================================ */
var THEME_KEY = 'jy-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

(function initTheme() {
  var saved = localStorage.getItem(THEME_KEY) || 'system';
  applyTheme(saved);
})();

/* ============================================================
   Frosted glass nav on scroll
   ============================================================ */
var topNav = document.getElementById('top-nav');

window.addEventListener('scroll', function () {
  topNav.classList.toggle('scrolled', window.scrollY > 0);
}, { passive: true });

/* ============================================================
   Nav active state
   ============================================================ */
function setActiveNav(url) {
  document.querySelectorAll('.nav-tab').forEach(function (el) {
    var elUrl = el.dataset.url;
    if (!elUrl) return;
    var isActive;
    if (elUrl === '/' || elUrl === '') {
      isActive = url === '/' || url === '';
    } else {
      isActive = url === elUrl || url.startsWith(elUrl);
    }
    el.classList.toggle('active', isActive);
  });
}

/* ============================================================
   Lazy loading images (IntersectionObserver)
   ============================================================ */
function initLazyLoad() {
  var lazyImages = document.querySelectorAll('img[data-src]');
  if (!lazyImages.length) return;

  if (!('IntersectionObserver' in window)) {
    lazyImages.forEach(function (img) { img.src = img.dataset.src; });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  lazyImages.forEach(function (img) { observer.observe(img); });
}

/* ============================================================
   SPA navigation
   ============================================================ */
var contentArea   = document.getElementById('content-area');
var navHamburger  = document.getElementById('nav-hamburger');
var navMobileMenu = document.getElementById('nav-mobile-menu');

function applyContent(incoming, url, title) {
  contentArea.innerHTML = incoming.innerHTML;
  initLazyLoad();
  window.scrollTo(0, 0);
  setActiveNav(url);
  document.title = title || 'Jungyoung Lee';
  // Close mobile menu on navigation
  if (navMobileMenu) navMobileMenu.classList.remove('open');
  if (navHamburger) navHamburger.querySelector('.material-symbols-outlined').textContent = 'menu';
}

function loadContent(url) {
  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text();
    })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var incoming = doc.getElementById('content-area');
      if (!incoming) { window.location.href = url; return; }

      var title = doc.title || 'Jungyoung Lee';
      history.pushState({ url: url }, title, url);

      if (document.startViewTransition) {
        document.startViewTransition(function () {
          applyContent(incoming, url, title);
        });
      } else {
        applyContent(incoming, url, title);
      }
    })
    .catch(function () {
      window.location.href = url;
    });
}

// Intercept all [data-url] link clicks across the page
document.addEventListener('click', function (e) {
  var link = e.target.closest('[data-url]');
  if (!link) return;
  if (link.target === '_blank') return;
  var url = link.dataset.url;
  if (!url) return;
  e.preventDefault();
  if (url === window.location.pathname) return;
  loadContent(url);
});

// Handle browser back/forward
window.addEventListener('popstate', function (e) {
  var url = (e.state && e.state.url) || window.location.pathname;

  fetch(url)
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var incoming = doc.getElementById('content-area');
      if (!incoming) { window.location.href = url; return; }

      var title = doc.title || 'Jungyoung Lee';

      if (document.startViewTransition) {
        document.startViewTransition(function () {
          applyContent(incoming, url, title);
        });
      } else {
        applyContent(incoming, url, title);
      }
    })
    .catch(function () {
      window.location.href = url;
    });
});

// Hamburger menu toggle
if (navHamburger && navMobileMenu) {
  navHamburger.addEventListener('click', function () {
    var isOpen = navMobileMenu.classList.toggle('open');
    navHamburger.querySelector('.material-symbols-outlined').textContent = isOpen ? 'close' : 'menu';
  });
}

// Initialize on page load
setActiveNav(window.location.pathname);
initLazyLoad();
history.replaceState({ url: window.location.pathname }, document.title, window.location.pathname);
