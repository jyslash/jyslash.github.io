/* ============================================================
   Theme — persist across sessions
   ============================================================ */
var THEME_KEY = 'jy-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function updateThemeIcon() {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var current = document.documentElement.getAttribute('data-theme');
  var isDark = current === 'dark' ||
    (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  btn.querySelector('.theme-toggle-icon').textContent = isDark ? 'light_mode' : 'dark_mode';
}

(function initTheme() {
  var saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
  updateThemeIcon();
})();

document.addEventListener('click', function (e) {
  if (!e.target.closest('#theme-toggle')) return;
  var current = document.documentElement.getAttribute('data-theme');
  var isDark = current === 'dark' ||
    (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme(isDark ? 'light' : 'dark');
  updateThemeIcon();
});

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
   ASCII wave animation (About page)
   ============================================================ */
var ASCII_WAVE_FRAMES = [
  [' \\o/ ', '  |  ', ' / \\ '],
  [' \\o  ', '  |\\  ', ' / \\ '],
  ['  o  ', ' /|  ', ' / \\ '],
  ['  o/ ', ' /|  ', ' / \\ '],
  [' \\o/ ', '  |  ', ' / \\ '],
];

var _waveInterval = null;

function initAsciiWave() {
  var el = document.getElementById('ascii-wave');
  if (_waveInterval) { clearInterval(_waveInterval); _waveInterval = null; }
  if (!el) return;
  var frame = 0;
  function draw() { el.textContent = ASCII_WAVE_FRAMES[frame].join('\n'); frame = (frame + 1) % ASCII_WAVE_FRAMES.length; }
  draw();
  _waveInterval = setInterval(draw, 380);
}

/* ============================================================
   SPA navigation
   ============================================================ */
var contentArea   = document.getElementById('content-area');
var navHamburger  = document.getElementById('nav-hamburger');
var navMobileMenu = document.getElementById('nav-mobile-menu');

function applyContent(incoming, url, title) {
  if (_waveInterval) { clearInterval(_waveInterval); _waveInterval = null; }
  contentArea.innerHTML = incoming.innerHTML;
  initLazyLoad();
  initAsciiWave();
  window.scrollTo(0, 0);
  setActiveNav(url);
  document.title = title || 'Jungyoung Lee';
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

// Footer clock
function initFooterClock() {
  var localEl = document.getElementById('footer-time-local');
  var seoulEl = document.getElementById('footer-time-seoul');
  if (!localEl || !seoulEl) return;

  function tick() {
    var now = new Date();
    localEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    seoulEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      timeZone: 'Asia/Seoul'
    });
  }

  tick();
  setInterval(tick, 1000);
}

// Initialize on page load
setActiveNav(window.location.pathname);
initLazyLoad();
initAsciiWave();
initFooterClock();
history.replaceState({ url: window.location.pathname }, document.title, window.location.pathname);
