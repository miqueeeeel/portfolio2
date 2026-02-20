/* ============================================================
   MIQUEL ALOMAR PORTFOLIO — script.js
   Temática espacial con malla de gravedad interactiva
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   1. GRAVITY MESH — Canvas por sección
   Cada sección tiene un canvas de fondo con una cuadrícula que
   se deforma hacia el cursor, simulando una malla gravitatoria.
   ───────────────────────────────────────────────────────────── */
class GravityMesh {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mouse = { x: -9999, y: -9999 };
    this.points = [];
    this.animFrame = null;
    this.CELL_SIZE = 60; // target cell size in px
    this.resize();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Dynamic grid based on canvas size
    this.cols = Math.max(4, Math.ceil(this.canvas.width / this.CELL_SIZE) + 1);
    this.rows = Math.max(4, Math.ceil(this.canvas.height / this.CELL_SIZE) + 1);
    this.cellW = this.canvas.width / (this.cols - 1);
    this.cellH = this.canvas.height / (this.rows - 1);
    this.buildGrid();
  }

  buildGrid() {
    this.points = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.points.push({
          ox: c * this.cellW,
          oy: r * this.cellH,
          x: c * this.cellW,
          y: r * this.cellH,
          vx: 0,
          vy: 0,
        });
      }
    }
  }

  bindEvents() {
    this._onMouseMove = (e) => {
      // Convert viewport mouse position to canvas-relative coords
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    };
    this._onMouseLeave = () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };
    window.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseleave', this._onMouseLeave);

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  }

  destroy() {
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseleave', this._onMouseLeave);
    window.removeEventListener('resize', this._onResize);
  }

  update() {
    const GRAVITY_RADIUS = 180;
    const GRAVITY_STRENGTH = 0.30;
    const SPRING = 0.08;
    const DAMPING = 0.72;

    // Only update points near the visible viewport for performance
    const rect = this.canvas.getBoundingClientRect();
    const viewTop = -rect.top;
    const viewBottom = viewTop + window.innerHeight;

    for (const p of this.points) {
      // Skip points far from visible area (with margin)
      if (p.oy < viewTop - 300 || p.oy > viewBottom + 300) {
        // Snap back to rest position
        p.x += (p.ox - p.x) * 0.1;
        p.y += (p.oy - p.y) * 0.1;
        p.vx = 0;
        p.vy = 0;
        continue;
      }

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let ax = 0, ay = 0;

      if (dist < GRAVITY_RADIUS && dist > 0) {
        const force = (1 - dist / GRAVITY_RADIUS) * GRAVITY_STRENGTH;
        ax = (dx / dist) * force * 18;
        ay = (dy / dist) * force * 18;
      }

      // Muelle hacia posición original
      ax += (p.ox - p.x) * SPRING;
      ay += (p.oy - p.y) * SPRING;

      p.vx = (p.vx + ax) * DAMPING;
      p.vy = (p.vy + ay) * DAMPING;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  draw() {
    const { ctx, cols, rows } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Only draw visible portion for performance
    const rect = this.canvas.getBoundingClientRect();
    const viewTop = -rect.top;
    const viewBottom = viewTop + window.innerHeight;
    const marginPx = 200;

    ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
    ctx.lineWidth = 1;

    // Líneas horizontales
    for (let r = 0; r < rows; r++) {
      const baseY = this.points[r * cols].oy;
      if (baseY < viewTop - marginPx || baseY > viewBottom + marginPx) continue;
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        const p = this.points[r * cols + c];
        if (c === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Líneas verticales
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      let started = false;
      for (let r = 0; r < rows; r++) {
        const p = this.points[r * cols + c];
        if (p.oy < viewTop - marginPx || p.oy > viewBottom + marginPx) {
          started = false;
          continue;
        }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Nodos de la malla con brillo dinámico (solo visibles)
    for (const p of this.points) {
      if (p.oy < viewTop - marginPx || p.oy > viewBottom + marginPx) continue;

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glow = dist < 200 ? (1 - dist / 200) : 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5 + glow * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${0.2 + glow * 0.8})`;
      ctx.fill();

      if (glow > 0.4) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 + glow * 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${glow * 0.12})`;
        ctx.fill();
      }
    }
  }

  animate() {
    this.update();
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }
}

/* ─────────────────────────────────────────────────────────────
   2. CAMPO DE ESTRELLAS — Hero section
   ───────────────────────────────────────────────────────────── */
class StarField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.mouse = { x: 0, y: 0 };
    this.resize();
    this.spawn();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
    this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
  }

  spawn() {
    this.stars = [];
    const count = Math.floor((this.canvas.width * this.canvas.height) / 4500);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 1.8 + 0.2,
        speed: Math.random() * 0.12 + 0.04,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('resize', () => {
      this.resize();
      this.spawn();
    });
  }

  animate() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() * 0.001;

    for (const s of this.stars) {
      const px = s.x + (this.mouse.x / (canvas.width || 1) - 0.5) * s.r * 8;
      const py = s.y + (this.mouse.y / (canvas.height || 1) - 0.5) * s.r * 8;
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.twinkleOffset);
      const alpha = s.opacity * (0.6 + 0.4 * twinkle);

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();

      // Cruz de luz para estrellas grandes
      if (s.r > 1.4) {
        ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.35})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px - s.r * 3, py); ctx.lineTo(px + s.r * 3, py);
        ctx.moveTo(px, py - s.r * 3); ctx.lineTo(px, py + s.r * 3);
        ctx.stroke();
      }

      s.y += s.speed;
      if (s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

/* ─────────────────────────────────────────────────────────────
   3. CURSOR ESPACIAL PERSONALIZADO
   ───────────────────────────────────────────────────────────── */
class SpaceCursor {
  constructor() {
    this.dot = this.createElement('cursor-dot');
    this.ring = this.createElement('cursor-ring');
    this.pos = { x: 0, y: 0 };
    this.ringPos = { x: 0, y: 0 };
    this.inject();
    this.bind();
    this.animate();
  }

  createElement(cls) {
    const el = document.createElement('div');
    el.className = cls;
    return el;
  }

  inject() {
    const style = document.createElement('style');
    style.textContent = `
      body { cursor: none; }
      a, button, .project-item { cursor: none; }

      .cursor-dot {
        position: fixed; top: 0; left: 0;
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #60a5fa;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, background 0.2s;
        box-shadow: 0 0 8px #60a5fa, 0 0 20px #60a5fa80;
      }
      .cursor-ring {
        position: fixed; top: 0; left: 0;
        width: 36px; height: 36px;
        border-radius: 50%;
        border: 1.5px solid rgba(96,165,250,0.6);
        pointer-events: none;
        z-index: 99998;
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s, border-color 0.3s;
      }
      .cursor-dot.hovered { width: 10px; height: 10px; background: #a78bfa; box-shadow: 0 0 14px #a78bfa; }
      .cursor-ring.hovered { width: 56px; height: 56px; border-color: rgba(167,139,250,0.5); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.dot);
    document.body.appendChild(this.ring);
  }

  bind() {
    window.addEventListener('mousemove', (e) => {
      this.pos.x = e.clientX;
      this.pos.y = e.clientY;
    });

    document.querySelectorAll('a, button, .project-item, .profile-pic').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('hovered');
        this.ring.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('hovered');
        this.ring.classList.remove('hovered');
      });
    });
  }

  animate() {
    this.dot.style.left = this.pos.x + 'px';
    this.dot.style.top = this.pos.y + 'px';

    this.ringPos.x += (this.pos.x - this.ringPos.x) * 0.12;
    this.ringPos.y += (this.pos.y - this.ringPos.y) * 0.12;
    this.ring.style.left = this.ringPos.x + 'px';
    this.ring.style.top = this.ringPos.y + 'px';

    requestAnimationFrame(() => this.animate());
  }
}

/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEAL
   ───────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const sections = document.querySelectorAll('section');

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(60px)';
    s.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────────────────────
   5. TYPEWRITER en .skills
   ───────────────────────────────────────────────────────────── */
function initTypewriter() {
  const el = document.querySelector('.skills');
  if (!el) return;

  const phrases = [
    'Java || JavaScript || Python || C#',
    'Builder of cool things ✦',
    'Turning coffee into code ☕',
    'Exploring the digital cosmos 🚀',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 60);
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 30);
    }
  }
  tick();
}

/* ─────────────────────────────────────────────────────────────
   6. MENÚ — Ocultar al hacer scroll hacia abajo
   ───────────────────────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.querySelector('.menu');
  if (!nav) return;
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 100) {
      nav.style.transform = 'translateX(-50%) translateY(-120px)';
      nav.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    } else {
      nav.style.transform = 'translateX(-50%) translateY(0)';
    }
    lastY = y;
  });
}

/* ─────────────────────────────────────────────────────────────
   7. CANVAS: Malla de gravedad global (una sola para todo #content)
   ───────────────────────────────────────────────────────────── */
function setupMeshCanvases() {
  const content = document.getElementById('content');
  if (!content) return;

  // Ensure positioning context
  content.style.position = 'relative';

  const canvas = document.createElement('canvas');
  canvas.id = 'gravity-mesh-canvas';
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;

  content.insertBefore(canvas, content.firstChild);

  // Ensure all section content stays above the canvas
  content.querySelectorAll('section').forEach(section => {
    section.style.position = 'relative';
    section.style.zIndex = '1';
  });

  // Also elevate <hr> inside content
  content.querySelectorAll('hr').forEach(hr => {
    hr.style.position = 'relative';
    hr.style.zIndex = '1';
  });

  new GravityMesh(canvas);
}

/* ─────────────────────────────────────────────────────────────
   8. HERO CANVAS — Campo estelar en el header
   ───────────────────────────────────────────────────────────── */
function setupHeroStarfield() {
  const hero = document.querySelector('.Capcelera');
  if (!hero) return;

  if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
  hero.style.overflow = 'hidden';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
  hero.insertBefore(canvas, hero.firstChild);

  Array.from(hero.children).forEach(child => {
    if (child !== canvas) {
      child.style.position = 'relative';
      child.style.zIndex = '1';
    }
  });

  new StarField(canvas);
}

/* ─────────────────────────────────────────────────────────────
   9. PARALLAX suave en el hero
   ───────────────────────────────────────────────────────────── */
function initParallax() {
  const hero = document.querySelector('.Capcelera');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    hero.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  });
}

/* ─────────────────────────────────────────────────────────────
   10. ESTRELLAS FUGACES ocasionales
   ───────────────────────────────────────────────────────────── */
function initShootingStars() {
  const bg = document.querySelector('.background');
  if (!bg) return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes shootStar {
      0%   { opacity: 0; transform: rotate(30deg) translateX(0); }
      10%  { opacity: 1; }
      100% { opacity: 0; transform: rotate(30deg) translateX(220px); }
    }
  `;
  document.head.appendChild(style);

  function shoot() {
    const star = document.createElement('div');
    const startX = Math.random() * 90;
    const startY = Math.random() * 50;
    const len = 80 + Math.random() * 120;

    star.style.cssText = `
      position: absolute;
      left: ${startX}%;
      top: ${startY}%;
      width: ${len}px;
      height: 1.5px;
      background: linear-gradient(90deg, rgba(255,255,255,0.9), transparent);
      opacity: 0;
      animation: shootStar 0.7s ease-out forwards;
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(255,255,255,0.5);
    `;
    bg.appendChild(star);
    setTimeout(() => star.remove(), 800);
    setTimeout(shoot, 2500 + Math.random() * 4000);
  }

  setTimeout(shoot, 1500);
}

/* ─────────────────────────────────────────────────────────────
   11. FLIP CARDS — Click‑to‑flip (mobile / fallback)
   ───────────────────────────────────────────────────────────── */
function initFlipCards() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
}

/* ─────────────────────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setupHeroStarfield();
  setupMeshCanvases();
  initScrollReveal();
  initTypewriter();
  initNavScroll();
  initParallax();
  initShootingStars();
  initFlipCards();
  new SpaceCursor();
});