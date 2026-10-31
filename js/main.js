/* ==========================================================================
   Diana & Roni — site scripts (no dependencies)
   ========================================================================== */

// ✏️ Wedding date and time used by the countdown (Tbilisi is UTC+4).
const WEDDING_DATE = new Date("2027-03-23T18:00:00+04:00");

const root = document.documentElement;
root.classList.add("js");
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
  setLanguage(saved || (browserHebrew ? "he" : "en"));

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
  const fields = {
    days: el.querySelector('[data-unit="days"]'),
    hours: el.querySelector('[data-unit="hours"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
  };

  function tick() {
    const diff = WEDDING_DATE - Date.now();
    if (diff <= 0) { el.hidden = true; return false; }
    fields.days.textContent = Math.floor(diff / 86400000);
    fields.hours.textContent = Math.floor(diff / 3600000) % 24;
    fields.minutes.textContent = Math.floor(diff / 60000) % 60;
    return true;
  }
  if (tick()) setInterval(tick, 30000);
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

/* ---------- Gallery lightbox ---------- */
(function initLightbox() {
  const buttons = [...document.querySelectorAll("#galleryGrid .gallery__item")];
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  const caption = document.getElementById("lbCaption");
  const btnClose = document.getElementById("lbClose");
  const btnPrev = document.getElementById("lbPrev");
  const btnNext = document.getElementById("lbNext");
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + buttons.length) % buttons.length;
    const thumb = buttons[index].querySelector("img");
    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    // Optional Hebrew caption: add data-caption-he="..." to an <img>
    const text = (root.lang === "he" && thumb.dataset.captionHe) || thumb.dataset.caption || "";
    caption.textContent = text;
    caption.hidden = !text;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    btnClose.focus();
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  buttons.forEach((b, i) => b.addEventListener("click", () => open(i)));
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", () => show(index - 1));
  btnNext.addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    const rtl = root.dir === "rtl";
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + (rtl ? -1 : 1));
    else if (e.key === "ArrowLeft") show(index + (rtl ? 1 : -1));
    else if (e.key === "Tab") {
      // Keep keyboard focus inside the viewer
      const focusables = [btnClose, btnPrev, btnNext];
      const pos = focusables.indexOf(document.activeElement);
      e.preventDefault();
      focusables[(pos + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
    }
  });

  // Swipe on phones
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    const forward = dx < 0 ? 1 : -1;
    show(index + (root.dir === "rtl" ? -forward : forward));
  });
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
