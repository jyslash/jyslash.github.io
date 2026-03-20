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
   Language toggle (posts)
   ============================================================ */
var LANG_KEY = 'jy-lang';

function applyLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.querySelectorAll('.post-lang').forEach(function (el) {
    el.style.display = el.dataset.lang === lang ? 'block' : 'none';
  });
  document.querySelectorAll('.lang-toggle').forEach(function (btn) {
    btn.textContent = lang === 'ko' ? 'Show in English' : 'Show in Korean';
  });
}

function initLangToggle() {
  var btns = document.querySelectorAll('.lang-toggle');
  if (!btns.length) return;
  applyLang(localStorage.getItem(LANG_KEY) || 'en');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang((localStorage.getItem(LANG_KEY) || 'en') === 'en' ? 'ko' : 'en');
    });
  });
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
  initLangToggle();
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

// Footer SVG clock
function initFooterClock() {
  var lh = document.getElementById('clock-local-hour');
  var lm = document.getElementById('clock-local-min');
  var ls = document.getElementById('clock-local-sec');
  var sh = document.getElementById('clock-seoul-hour');
  var sm = document.getElementById('clock-seoul-min');
  var ss = document.getElementById('clock-seoul-sec');
  if (!lh) return;

  function getTimeParts(date, tz) {
    var parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false, timeZone: tz
    }).formatToParts(date);
    return {
      h: +parts.find(function(p){ return p.type === 'hour'; }).value % 12,
      m: +parts.find(function(p){ return p.type === 'minute'; }).value,
      s: +parts.find(function(p){ return p.type === 'second'; }).value
    };
  }

  function rot(el, deg) { el.setAttribute('transform', 'rotate(' + deg + ',50,50)'); }

  function tick() {
    var now = new Date();
    var localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var l = getTimeParts(now, localTz);
    var k = getTimeParts(now, 'Asia/Seoul');
    rot(lh, (l.h / 12) * 360 + (l.m / 60) * 30);
    rot(lm, (l.m / 60) * 360 + (l.s / 60) * 6);
    rot(ls, l.s * 6);
    rot(sh, (k.h / 12) * 360 + (k.m / 60) * 30);
    rot(sm, (k.m / 60) * 360 + (k.s / 60) * 6);
    rot(ss, k.s * 6);
  }

  tick();
  setInterval(tick, 1000);
}

// Initialize on page load
setActiveNav(window.location.pathname);
initLazyLoad();
initAsciiWave();
initLangToggle();
initFooterClock();
history.replaceState({ url: window.location.pathname }, document.title, window.location.pathname);
