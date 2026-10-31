/* ==========================================================================
   Diana & Ronnie — site scripts (no dependencies)
   SHARED by both branches (main = English, hebrew-version = Hebrew).
   ========================================================================== */

// ✏️ Wedding date used by the countdown (Tbilisi is UTC+4).
const WEDDING_DATE = new Date("2027-03-23T18:00:00+04:00");

document.documentElement.classList.add("js");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile navigation ---------- */
(function initNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#navMenu, #navToggle")) setOpen(false);
  });
})();

/* ---------- Countdown (days only) ---------- */
(function initCountdown() {
  const box = document.getElementById("countdown");
  const days = document.getElementById("countdownDays");

  function tick() {
    const diff = WEDDING_DATE - Date.now();
    if (diff <= 0) { box.hidden = true; return; }
    days.textContent = Math.ceil(diff / 86400000);
  }
  tick();
  setInterval(tick, 60 * 60 * 1000);
})();

/* ---------- Reveal on scroll ---------- */
(function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
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

/* ---------- Falling snow ----------
   Soft, blurred snowflakes drawn from one pre-rendered sprite: cheap to draw,
   and the faint blue rim keeps them visible on the white background. */
(function initSnow() {
  if (prefersReducedMotion) return;
  const canvas = document.getElementById("snow");
  const ctx = canvas.getContext("2d");

  const SPRITE = 64;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE;
  const sctx = sprite.getContext("2d");
  const g = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
  g.addColorStop(0, "rgba(255, 255, 255, 1)");
  g.addColorStop(0.35, "rgba(255, 255, 255, 0.95)");
  g.addColorStop(0.6, "rgba(200, 220, 238, 0.45)");
  g.addColorStop(1, "rgba(200, 220, 238, 0)");
  sctx.fillStyle = g;
  sctx.fillRect(0, 0, SPRITE, SPRITE);

  let flakes = [];
  let w = 0, h = 0, lastWidth = 0, running = true, wind = 0, t = 0;

  function makeFlake(anywhere) {
    const depth = Math.random();               // 0 = far, 1 = near
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -20,
      size: 3 + depth * 7,
      speed: 0.3 + depth * 0.9,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.004 + Math.random() * 0.01,
      alpha: 0.45 + depth * 0.5,
    };
  }

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
      const count = Math.round(Math.min(90, Math.max(30, (w * h) / 16000)));
      flakes = Array.from({ length: count }, () => makeFlake(true));
    }
  }

  function frame() {
    if (!running) return;
    t += 1;
    wind = Math.sin(t / 600) * 0.35;           // slow, gentle gusts
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.sway += f.swaySpeed;
      f.y += f.speed;
      f.x += Math.sin(f.sway) * 0.4 + wind * f.speed;
      if (f.y > h + 20) Object.assign(f, makeFlake(false));
      if (f.x > w + 20) f.x = -20;
      else if (f.x < -20) f.x = w + 20;
      ctx.globalAlpha = f.alpha;
      ctx.drawImage(sprite, f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
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
