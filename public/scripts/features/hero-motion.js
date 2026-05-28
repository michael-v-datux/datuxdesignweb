function initHeroOrb(hero, reducedMotion) {
  const orb = hero.querySelector('.hero__orb');
  if (!orb || !(orb instanceof HTMLElement)) return;

  const STORAGE_KEY = 'hero-orb-flip-seen';
  const FLIP_HOLD_MS = 6200;
  const LONG_HOVER_MS = 1200;
  const RAPID_HOVER_COUNT = 4;
  const RAPID_HOVER_WINDOW_MS = 2000;

  let flipTimeout = 0;
  let hoverTimeout = 0;
  let enterCount = 0;
  let enterWindow = 0;
  let flipped = false;
  let animating = false;

  function setFlipped(on) {
    flipped = on;
    orb.classList.toggle('is-flipped', on);
    orb.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function runFlipAnimation(forward) {
    if (reducedMotion) {
      setFlipped(forward);
      return;
    }

    const flipper = orb.querySelector('.hero__orb-flipper');
    if (!flipper) return;

    animating = true;
    orb.classList.remove('is-animating-in', 'is-animating-out');
    void orb.offsetWidth;
    orb.classList.add(forward ? 'is-animating-in' : 'is-animating-out');

    flipper.addEventListener(
      'animationend',
      (event) => {
        if (event.target !== flipper) return;
        orb.classList.remove('is-animating-in', 'is-animating-out');
        setFlipped(forward);
        animating = false;
      },
      { once: true }
    );
  }

  function triggerFlip() {
    if (flipped || animating) return;

    runFlipAnimation(true);
    sessionStorage.setItem(STORAGE_KEY, '1');
    clearTimeout(flipTimeout);
    flipTimeout = window.setTimeout(() => {
      if (!flipped) return;
      runFlipAnimation(false);
    }, FLIP_HOLD_MS);
  }

  function toggleFlip() {
    if (animating) return;

    if (flipped) {
      clearTimeout(flipTimeout);
      runFlipAnimation(false);
      return;
    }

    triggerFlip();
  }

  orb.addEventListener('pointerenter', () => {
    if (reducedMotion || sessionStorage.getItem(STORAGE_KEY)) return;

    clearTimeout(hoverTimeout);
    hoverTimeout = window.setTimeout(triggerFlip, LONG_HOVER_MS);

    const now = Date.now();
    if (now - enterWindow > RAPID_HOVER_WINDOW_MS) {
      enterCount = 0;
      enterWindow = now;
    }
    enterCount += 1;
    if (enterCount >= RAPID_HOVER_COUNT) {
      clearTimeout(hoverTimeout);
      triggerFlip();
    }
  });

  orb.addEventListener('pointerleave', () => {
    clearTimeout(hoverTimeout);
  });

  orb.addEventListener('click', (event) => {
    event.preventDefault();
    toggleFlip();
  });

  orb.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleFlip();
  });
}

function initHeroMotion() {
  if (window.matchMedia('(max-width: 880px)').matches) return;

  const hero = document.querySelector('.hero');
  const canvas = hero?.querySelector('.hero__canvas');
  const orb = hero?.querySelector('.hero__orb');
  if (!hero || !canvas || !(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dots = [];
  let width = 0;
  let height = 0;
  let gridCx = 0;
  let gridCy = 0;
  let gridR = 0;
  let rafId = 0;
  let time = 0;
  let visible = true;
  const pointer = { x: 0, y: 0, cx: 0, cy: 0, active: false };

  const ORB_RATIO = 0.145;
  const GRID_SCALE = 0.565;
  const PROXIMITY_RADIUS = 220;
  const DOT_BASE_RADIUS = 1.28;

  function buildDots() {
    dots = [];
    gridCx = width / 2;
    gridCy = height / 2;
    gridR = Math.min(width, height) * GRID_SCALE;
    const orbR = gridR * ORB_RATIO;
    const spacing = Math.max(9, gridR / 21);

    for (let y = -gridR; y <= gridR; y += spacing) {
      for (let x = -gridR; x <= gridR; x += spacing) {
        const dist = Math.hypot(x, y);
        if (dist <= gridR && dist > orbR + 5) {
          dots.push({
            bx: gridCx + x,
            by: gridCy + y,
            depth: 0.25 + (dist / gridR) * 0.75,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }

  function updateOrbParallax(normX, normY) {
    if (!orb || reducedMotion) return;
    orb.style.setProperty('--orb-x', `${normX * 10}px`);
    orb.style.setProperty('--orb-y', `${normY * 10}px`);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const autoX = Math.sin(time * 0.00045) * 0.35;
    const autoY = Math.cos(time * 0.00038) * 0.35;
    const normX = reducedMotion ? 0 : pointer.active ? pointer.x : autoX;
    const normY = reducedMotion ? 0 : pointer.active ? pointer.y : autoY;
    const parallaxX = normX * 18;
    const parallaxY = normY * 18;

    updateOrbParallax(normX, normY);

    for (const dot of dots) {
      const breathe = reducedMotion ? 1 : 1 + Math.sin(time * 0.0022 + dot.phase) * 0.07;
      const px = dot.bx + parallaxX * dot.depth;
      const py = dot.by + parallaxY * dot.depth;

      let proximity = 0;
      if (pointer.active && !reducedMotion) {
        const dist = Math.hypot(px - pointer.cx, py - pointer.cy);
        proximity = Math.max(0, 1 - dist / PROXIMITY_RADIUS);
      }

      const r = DOT_BASE_RADIUS * breathe * (1 + proximity * 0.95);
      const alpha = 0.44 + proximity * 0.48;
      const gray = Math.round(178 - proximity * 72);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${gray}, ${gray + 4}, ${gray + 10}, ${alpha})`;
      ctx.fill();
    }
  }

  function tick(now) {
    if (!visible) return;
    time = now;
    draw();
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (reducedMotion || rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  hero.addEventListener('pointermove', (event) => {
    if (reducedMotion) return;
    const rect = hero.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointer.cx = event.clientX - canvasRect.left;
    pointer.cy = event.clientY - canvasRect.top;
    pointer.active = true;
  });

  hero.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    },
    { threshold: 0.08 }
  );

  observer.observe(hero);
  resize();
  window.addEventListener('resize', resize, { passive: true });
  initHeroOrb(hero, reducedMotion);

  if (reducedMotion) {
    draw();
  } else {
    startLoop();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion, { once: true });
} else {
  initHeroMotion();
}
