/* ==========================================================================
   Diana & Roni — site scripts (no dependencies)
   ========================================================================== */

// ✏️ Wedding date and time used by the countdown (Tbilisi is UTC+4).
const WEDDING_DATE = new Date("2027-03-23T18:00:00+04:00");

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Language (English / Hebrew) ---------- */
function setLanguage(lang) {
  root.lang = lang;
  root.dir = lang === "he" ? "rtl" : "ltr";
  try { localStorage.setItem("lang", lang); } catch (_) { /* private mode */ }
}

(function initLanguage() {
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch (_) {}
  const browserHebrew = (navigator.language || "").toLowerCase().startsWith("he");
  // A link like ?lang=he (or ?lang=en) always opens the site in that language.
  const fromLink = new URLSearchParams(location.search).get("lang");
  const linked = fromLink === "he" || fromLink === "en" ? fromLink : null;
  setLanguage(linked || saved || (browserHebrew ? "he" : "en"));

  document.getElementById("langToggle").addEventListener("click", () => {
    setLanguage(root.lang === "he" ? "en" : "he");
  });
})();

/* ---------- Mobile navigation ---------- */
(function initNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#navMenu, #navToggle")) close();
  });
})();

/* ---------- Countdown ---------- */
(function initCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const days = el.querySelector('[data-unit="days"]');

  function tick() {
    const diff = WEDDING_DATE - Date.now();
    if (diff <= 0) { el.hidden = true; return false; }
    days.textContent = Math.ceil(diff / 86400000);
    return true;
  }
  if (tick()) setInterval(tick, 60 * 60 * 1000);
})();

/* ---------- Reveal on scroll ---------- */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  // Only hide items for the fade-in once this code is running, so content never stays invisible
  root.classList.add("js");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach((el) => io.observe(el));
})();

/* ---------- Falling snow ---------- */
(function initSnow() {
  if (prefersReducedMotion) return;
  const canvas = document.getElementById("snow");
  const ctx = canvas.getContext("2d");
  let flakes = [];
  let w, h, lastWidth = 0, running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Mobile browsers fire resize when the address bar hides; only reseed on width changes
    if (w !== lastWidth) {
      lastWidth = w;
      const count = Math.round(Math.min(70, (w * h) / 22000));
      flakes = Array.from({ length: count }, () => makeFlake(true));
    }
  }

  function makeFlake(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: 1 + Math.random() * 2.4,
      speed: 0.25 + Math.random() * 0.6,
      drift: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.45,
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.speed;
      f.drift += 0.01;
      f.x += Math.sin(f.drift) * 0.3;
      if (f.y > h + 10) Object.assign(f, makeFlake(false));
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143, 179, 212, ${f.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
