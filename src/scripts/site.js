// Runs once per visit. Astro's ClientRouter swaps pages without a reload, so
// click handlers are delegated on `document`, and per-page setup runs on
// `astro:page-load` (fired on first load and after every navigation).
import './view-switch.js';

/* ============================================================
   Theme — persist across sessions
   ============================================================ */
var THEME_KEY = 'jy-theme';

function save(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

function isDark() {
  var current = document.documentElement.getAttribute('data-theme');
  return current === 'dark' ||
    (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function updateThemeIcon() {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.querySelector('.theme-toggle-icon').textContent = isDark() ? 'light_mode' : 'dark_mode';
}

document.addEventListener('click', function (e) {
  if (!e.target.closest('#theme-toggle')) return;
  var theme = isDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  save(THEME_KEY, theme);
  updateThemeIcon();
});

// The incoming page is rendered without a theme; carry the current one over.
document.addEventListener('astro:before-swap', function (e) {
  e.newDocument.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme'));
});

/* ============================================================
   Language — remember an explicit choice (read by the / redirect)
   ============================================================ */
document.addEventListener('click', function (e) {
  var link = e.target.closest('[data-lang-switch]');
  if (link) save('jy-lang', link.dataset.langSwitch);
});

/* ============================================================
   Frosted glass nav on scroll
   ============================================================ */
function updateNavScrolled() {
  var nav = document.getElementById('top-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 0);
}

window.addEventListener('scroll', updateNavScrolled, { passive: true });

/* ============================================================
   Hamburger menu
   ============================================================ */
document.addEventListener('click', function (e) {
  var btn = e.target.closest('#nav-hamburger');
  if (!btn) return;
  var isOpen = document.getElementById('nav-mobile-menu').classList.toggle('open');
  btn.setAttribute('aria-expanded', String(isOpen));
  btn.querySelector('.material-symbols-outlined').textContent = isOpen ? 'close' : 'menu';
});

/* ============================================================
   Donut animation (About → Highlight placeholder)
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
   Footer SVG clocks
   ============================================================ */
var _clockInterval = null;

function initFooterClock() {
  if (_clockInterval) { clearInterval(_clockInterval); _clockInterval = null; }
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
  _clockInterval = setInterval(tick, 1000);
}

/* ============================================================
   Per-page setup
   ============================================================ */
document.addEventListener('astro:page-load', function () {
  updateThemeIcon();
  updateNavScrolled();
  initAsciiWave();
  initFooterClock();
});
