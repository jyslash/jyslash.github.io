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
   Donut animation (About page)
   Torus projected in 3D; surface luminance drives emoji selection.
   ============================================================ */
var _waveInterval = null;

function initAsciiWave() {
  var el = document.getElementById('ascii-wave');
  if (_waveInterval) { clearInterval(_waveInterval); _waveInterval = null; }
  if (!el) return;

  var W = 38, H = 20;
  // Luminance palette: bright → dim surface
  var HANDS = ['🌕', '🌖', '🌗', '🌑'];

  // Torus geometry constants
  var R1 = 1, R2 = 2, K2 = 5;
  // K1 scales the projection to fill the grid width
  var K1 = W * K2 * 3 / (8 * (R1 + R2));

  var A = 0.6, B = 0; // rotation angles

  function frame() {
    var osc  = new Array(W * H).fill(-1);        // -1 = empty
    var zbuf = new Array(W * H).fill(-Infinity);

    var cosA = Math.cos(A), sinA = Math.sin(A);
    var cosB = Math.cos(B), sinB = Math.sin(B);

    for (var theta = 0; theta < 6.283; theta += 0.06) {
      var cosT = Math.cos(theta), sinT = Math.sin(theta);
      for (var phi = 0; phi < 6.283; phi += 0.022) {
        var cosP = Math.cos(phi), sinP = Math.sin(phi);

        // Circle cross-section point
        var cx = R2 + R1 * cosT;
        var cy = R1 * sinT;

        // Rotate around X-axis by A, then Z-axis by B
        var x = cx * (cosB * cosP + sinA * sinB * sinP) - cy * cosA * sinB;
        var y = cx * (sinB * cosP - sinA * cosB * sinP) + cy * cosA * cosB;
        var z = K2 + cosA * cx * sinP + cy * sinA;
        var ooz = 1 / z;

        var xp = Math.round(W / 2 + K1 * ooz * x);
        var yp = Math.round(H / 2 - K1 * ooz * y * 0.52); // 0.52 corrects char aspect
        if (xp < 0 || xp >= W || yp < 0 || yp >= H) continue;

        // Surface normal dot light direction → luminance ∈ [-1, 1]
        var L = cosP * cosT * sinB
              - cosA * cosT * sinP
              - sinA * sinT
              + cosB * (cosA * sinT - cosT * sinA * sinP);

        var idx = xp + yp * W;
        if (ooz > zbuf[idx]) {
          zbuf[idx] = ooz;
          osc[idx] = L > 0.5 ? 0 : L > 0 ? 1 : L > -0.4 ? 2 : 3;
        }
      }
    }

    var parts = [];
    for (var r = 0; r < H; r++) {
      for (var c = 0; c < W; c++) {
        var v = osc[c + r * W];
        parts.push('<span>' + (v < 0 ? ' ' : HANDS[v]) + '</span>');
      }
      parts.push('<br>');
    }
    el.innerHTML = parts.join('');

    A += 0.05;
    B += 0.022;
  }

  frame();
  _waveInterval = setInterval(frame, 55);
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
