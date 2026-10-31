/* ==========================================================================
   Diana & Roni — site scripts (no dependencies)
   ========================================================================== */

// ✏️ Wedding date and time used by the countdown (Tbilisi is UTC+4).
const WEDDING_DATE = new Date("2027-03-23T18:00:00+04:00");

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Language (English / Hebrew / Russian) ---------- */
const LANGUAGES = ["en", "he", "ru"];
const langButtons = document.querySelectorAll("[data-set-lang]");

function setLanguage(lang) {
  root.lang = lang;
  root.dir = lang === "he" ? "rtl" : "ltr";
  langButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
  try { localStorage.setItem("lang", lang); } catch (_) { /* private mode */ }
}

(function initLanguage() {
  const known = (l) => (LANGUAGES.includes(l) ? l : null);
  let saved = null;
  try { saved = known(localStorage.getItem("lang")); } catch (_) {}
  const browser = known((navigator.language || "").toLowerCase().slice(0, 2));
  // A link like ?lang=he or ?lang=ru always opens the site in that language.
  const linked = known(new URLSearchParams(location.search).get("lang"));
  setLanguage(linked || saved || browser || "en");

  langButtons.forEach((b) => b.addEventListener("click", () => setLanguage(b.dataset.setLang)));
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
    // About 1 in 4 is a little six-armed snowflake; the rest are soft dots.
    const crystal = Math.random() < 0.25;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      crystal,
      r: crystal ? 6 + Math.random() * 6 : 1 + Math.random() * 2.4,
      speed: 0.25 + Math.random() * 0.6,
      drift: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.01,
      alpha: crystal ? 0.6 + Math.random() * 0.3 : 0.35 + Math.random() * 0.45,
    };
  }

  function drawCrystal(f) {
    const arm = f.r, branch = f.r * 0.38;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);
    ctx.strokeStyle = `rgba(120, 160, 199, ${f.alpha})`;
    ctx.lineWidth = Math.max(1.1, f.r / 7);
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -arm);
      // two small branches on each arm
      ctx.moveTo(0, -arm * 0.55);
      ctx.lineTo(-branch, -arm * 0.55 - branch);
      ctx.moveTo(0, -arm * 0.55);
      ctx.lineTo(branch, -arm * 0.55 - branch);
      ctx.rotate(Math.PI / 3);
    }
    ctx.stroke();
    ctx.restore();
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.speed;
      f.drift += 0.01;
      f.x += Math.sin(f.drift) * 0.3;
      f.angle += f.spin;
      if (f.y > h + 10) Object.assign(f, makeFlake(false));
      if (f.crystal) { drawCrystal(f); continue; }
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
