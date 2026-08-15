'use client';

import { useState, useEffect, useRef, useCallback } from 'react';



// ── WORLD MODE HOOK ───────────────────────────────────────────────────────────

function useWorldMode() {
  const [mode, setMode] = useState('chaos');

  useEffect(() => {
    const saved = localStorage.getItem('site-mode');
    if (saved) setMode(saved);
  }, []);

  const updateMode = useCallback((m) => {
    setMode(m);
    localStorage.setItem('site-mode', m);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return { mode, updateMode };
}

// ── MODE SWITCHER UI ──────────────────────────────────────────────────────────

function ModeSwitcher({ mode, updateMode }) {
  const modes = [
    { id: 'professional', label: '◼ Pro', title: 'Professional' },
    { id: 'chaos', label: '⚡ Chaos', title: 'Chaos' },
  ];
  return (
    <div className="mode-switcher" aria-label="Site mode">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`mode-btn${mode === m.id ? ' active' : ''}`}
          onClick={() => updateMode(m.id)}
          title={m.title}
          aria-pressed={mode === m.id}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── TILT HOOK ─────────────────────────────────────────────────────────────────
// Tracks pointer position over a card and exposes it as CSS custom properties
// so hover-capable, non-touch pointers get a live tilt + light-reflection
// response. On touch devices, or when the browser can't hover, or when the
// user prefers reduced motion, this is a no-op and cards fall back to the
// static CSS hover transform.

function useTilt() {
  const capable = useRef(null);
  const raf = useRef(null);
  const pending = useRef(null);

  const isCapable = () => {
    if (capable.current === null) {
      capable.current =
        typeof window !== 'undefined' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return capable.current;
  };

  const flush = () => {
    raf.current = null;
    const p = pending.current;
    if (!p) return;
    // Chaos mode drives its own fixed bounce transform on these cards and
    // never reads --tilt-x/--tilt-y, so writing them there only forces
    // pointless style recalculation on every mousemove (and can visibly
    // fight the elastic hover transition). Skip entirely in that mode.
    if (document.documentElement.getAttribute('data-mode') === 'chaos') return;
    p.el.style.setProperty('--tilt-x', p.tiltX);
    p.el.style.setProperty('--tilt-y', p.tiltY);
    p.el.style.setProperty('--glow-x', p.glowX);
    p.el.style.setProperty('--glow-y', p.glowY);
  };

  // Batched to at most once per animation frame — raw mousemove can fire
  // far faster than the display refreshes, and writing the custom
  // properties that often just churns style recalculation without any
  // visible benefit, which is what made the tilt feel jittery.
  const onMouseMove = useCallback((e) => {
    if (!isCapable()) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    pending.current = {
      el,
      tiltX: `${((py - 0.5) * -6).toFixed(2)}deg`,
      tiltY: `${((px - 0.5) * 8).toFixed(2)}deg`,
      glowX: `${(px * 100).toFixed(1)}%`,
      glowY: `${(py * 100).toFixed(1)}%`,
    };
    if (raf.current === null) raf.current = requestAnimationFrame(flush);
  }, []);

  const onMouseLeave = useCallback((e) => {
    if (raf.current !== null) { cancelAnimationFrame(raf.current); raf.current = null; }
    pending.current = null;
    const el = e.currentTarget;
    el.style.removeProperty('--tilt-x');
    el.style.removeProperty('--tilt-y');
  }, []);

  return { onMouseMove, onMouseLeave };
}

// ── STAR FIELD ────────────────────────────────────────────────────────────────
// Plain <canvas> + requestAnimationFrame — no charting/animation library.
// Held/slow drift while the boot sequence is up; the moment `booted` flips
// true it releases a decaying hyperspace "warp" burst synchronized with the
// cinematic content reveal, then settles into ambient drift with three
// interaction responses:
//   - pointer move nudges nearby stars outward AND throttle-emits a small
//     fading trail (hover-capable, fine pointer only — touch gets neither)
//   - scroll gives the drift a brief speed boost that decays back to baseline
// All state lives in plain closures/refs (no React state in the hot path),
// listeners are passive, and drawing is transform/opacity only. Respects
// prefers-reduced-motion (draws one static frame, no listeners) and re-tints
// itself for the active theme by reading data-theme each frame.

function StarField({ booted }) {
  const canvasRef = useRef(null);
  const bootedRef = useRef(booted);

  useEffect(() => { bootedRef.current = booted; }, [booted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let w = 0;
    let h = 0;
    let stars = [];
    let fieldStars = [];
    let bursts = [];
    let scrollBoost = 0;
    let warpBoost = 0;
    let wasBooted = bootedRef.current;
    let lastTrailAt = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const STAR_COUNT = 150;
    // A second, static layer spread evenly across the whole canvas. The
    // hyperspace stars above use a perspective projection that naturally
    // clusters near the vanishing point (center) — most of a star's life is
    // spent at large z, which projects close to center — so on its own it
    // reads as "stars in the middle, empty at the edges". This layer fixes
    // that by covering corners/sides uniformly, independent of the drift.
    const FIELD_STAR_COUNT = 100;
    const BOOT_SPEED = 0.2;
    const BASE_SPEED = 1.6;
    const MAX_BURST = 90;
    const TRAIL_INTERVAL_MS = 45;

    const makeStar = () => ({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
    });

    const makeFieldStar = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.4 + Math.random() * 1.1,
      baseAlpha: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: STAR_COUNT }, makeStar);
      fieldStars = Array.from({ length: FIELD_STAR_COUNT }, makeFieldStar);
    };
    resize();

    // small trail puffs from pointer movement — not a full burst, just 1-2
    // quick-fading dots per emission, throttled and capped.
    const spawnTrail = (x, y) => {
      const count = 2;
      for (let i = 0; i < count; i++) {
        bursts.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          life: 1,
          size: 1 + Math.random() * 1.2,
        });
      }
      if (bursts.length > MAX_BURST) bursts = bursts.slice(bursts.length - MAX_BURST);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const starColor = dark ? '226,232,255' : '124,58,237';
      ctx.fillStyle = `rgba(${starColor},0.9)`;

      // static field layer first (behind the hyperspace stars), evenly
      // covering the whole canvas including edges/corners
      const t = reduceMotion ? 0 : performance.now() / 1000;
      for (const fs of fieldStars) {
        const alpha = reduceMotion ? fs.baseAlpha : fs.baseAlpha + 0.12 * Math.sin(t * 0.6 + fs.phase);
        ctx.globalAlpha = Math.max(0.05, alpha);
        ctx.beginPath();
        ctx.arc(fs.x, fs.y, fs.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // boot -> revealed transition: release a decaying warp burst exactly
      // once, synchronized with the cinematic content reveal.
      if (!wasBooted && bootedRef.current) {
        warpBoost = 30;
        wasBooted = true;
      }

      const speed = wasBooted ? BASE_SPEED + scrollBoost + warpBoost : BOOT_SPEED;
      scrollBoost *= 0.92;
      warpBoost *= 0.91;

      for (const s of stars) {
        if (!reduceMotion) {
          s.z -= speed;
          if (s.z <= 1) Object.assign(s, makeStar(), { z: w });
        }
        const k = 128 / s.z;
        let sx = s.x * k + cx;
        let sy = s.y * k + cy;
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;

        if (pointer.active) {
          const dx = sx - pointer.x;
          const dy = sy - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 110;
          if (dist < radius && dist > 0.01) {
            const push = ((radius - dist) / radius) * 18;
            sx += (dx / dist) * push;
            sy += (dy / dist) * push;
          }
        }

        const size = Math.max(0.4, (1 - s.z / w) * 2.2);
        ctx.globalAlpha = Math.max(0.12, 1 - s.z / w);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (bursts.length) {
        const next = [];
        for (const b of bursts) {
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.96;
          b.vy *= 0.96;
          b.life -= 0.035;
          if (b.life > 0) {
            ctx.globalAlpha = b.life;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
            ctx.fill();
            next.push(b);
          }
        }
        bursts = next;
      }
      ctx.globalAlpha = 1;
    };

    let raf = null;
    if (reduceMotion) {
      draw();
    } else {
      const tick = () => { draw(); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);

    let onMove;
    let onLeave;
    if (!reduceMotion && canHover) {
      onMove = (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
        const now = performance.now();
        if (now - lastTrailAt > TRAIL_INTERVAL_MS) {
          lastTrailAt = now;
          spawnTrail(e.clientX, e.clientY);
        }
      };
      onLeave = () => { pointer.active = false; };
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseleave', onLeave, { passive: true });
    }

    let onScroll;
    if (!reduceMotion) {
      let lastY = window.scrollY;
      onScroll = () => {
        const y = window.scrollY;
        scrollBoost = Math.min(6, scrollBoost + Math.abs(y - lastY) * 0.06);
        lastY = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (onMove) window.removeEventListener('mousemove', onMove);
      if (onLeave) window.removeEventListener('mouseleave', onLeave);
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas className="starfield" ref={canvasRef} aria-hidden="true" />;
}

// ── MOTION LAYER ──────────────────────────────────────────────────────────────

function MotionLayer({ booted }) {
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    const onScroll = () => {
      if (!navbar) return;
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const blobs = document.querySelectorAll('.hero-blob');
    const onParallax = () => {
      const y = window.scrollY;
      blobs.forEach((b, i) => {
        const speed = 0.06 + i * 0.03;
        b.style.transform = b.style.transform.replace(/translateY\([^)]+\)/, '')
          + ` translateY(${y * speed}px)`;
      });
    };
    window.addEventListener('scroll', onParallax, { passive: true });

    const glows = document.querySelectorAll('.section-glow');
    const glowObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
        else e.target.classList.remove('visible');
      }),
      { threshold: 0.1 }
    );
    glows.forEach((g) => glowObserver.observe(g));

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onParallax);
      glowObserver.disconnect();
    };
  }, []);

  return (
    <>
      <StarField booted={booted} />
      <div className="dot-grid" aria-hidden="true" />
    </>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    role: 'Software Developer',
    company: 'Cyberinfrastructure for Network Science Center (CNS)',
    location: 'Bloomington, IN',
    period: 'Jan 2025 - Jan 2026',
    stack: ['Angular', 'TypeScript', 'RxJS', 'AWS S3', 'Jest', 'GitHub Actions'],
    bullets: [
      '<strong>Developed and enhanced</strong> Angular + TypeScript frontend on the NIH-funded Human Reference Atlas platform, integrating AWS S3 and building shared design system components and reusable libraries — ensuring WCAG accessibility and scalability, reducing frontend development overhead ~20%.',
      '<strong>Designed and implemented</strong> new user-facing interfaces in Angular and TypeScript, optimizing RxJS-driven data flows across critical user journeys and reducing redundant API requests ~20%.',
      '<strong>Owned production stability</strong> through monitoring, debugging, and resolving live issues — ensuring reliable releases with zero critical user-facing disruptions.',
      '<strong>Maintained CI/CD pipelines</strong> via GitHub Actions and leveraged AI-assisted developer tools to accelerate iteration and delivery, reducing build and release friction ~25%.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Tietoevry India Pvt. Ltd.',
    location: 'Pune, India',
    period: 'Jul 2022 - Jun 2024',
    stack: ['React', 'C#', '.NET', 'Node.js', 'Docker', 'Azure', 'Storybook', 'Selenium'],
    bullets: [
      '<strong>Extended and migrated</strong> healthcare frontend modules from Angular to React, building reusable component libraries in Storybook aligned with Figma designs, cutting frontend development effort ~35%.',
      '<strong>Developed and maintained</strong> full-stack features using Node.js and C#/.NET REST APIs with SQL Server, enforcing input validation, secure auth flows, and API access controls in a regulated healthcare environment.',
      '<strong>Maintained ~80%+ code coverage</strong> across unit, integration, and E2E layers using Jest, React Testing Library, Selenium, NUnit, and xUnit.',
      '<strong>Built CI/CD pipelines</strong> with Azure DevOps and Docker, automating deployments and reducing production incidents ~35% within an agile delivery workflow.',
    ],
  },
];

const PROJECTS = [
  {
    num: '01',
    name: 'DocuQuery',
    link: 'https://github.com/gauri2029/docuquery',
    image: './rag-photo.png',
    accent: 'cobalt',
    tagline: 'AI-powered documentation assistant for developers',
    desc: 'Think ChatGPT for your documents, but built for trust: document-scoped retrieval, source-cited answers, evidence tracing, and built-in observability so you can see how the system performs..',
    metrics: [
      { val: 'P95', label: 'sub-second latency' },
      { val: '5', label: 'orchestrated services' },
    ],
    stack: ['Spring Boot', 'OpenAI', 'ChromaDB', 'PostgreSQL', 'Docker', 'Prometheus', 'Grafana'],
    problem: 'Developers waste time digging through internal docs. Most AI tools send data to third-party servers — not viable for private or sensitive documentation.',
    approach: 'Self-hosted RAG pipeline: documents are chunked with overlapping windows, embedded via OpenAI text-embedding-3-small, and stored in ChromaDB. Queries run semantic search over stored chunks and pass the top results to GPT-4o-mini with strict prompt constraints to prevent hallucination and enforce source citations.',
    impact: 'P95 query latency under 1 second. Full observability with custom Micrometer metrics — P50/P95/P99 latency, error rates, and throughput tracked via Prometheus and Grafana dashboards.',
    period: 'Dec 2025 - Jan 2026',
  },
  {
    num: '02',
    name: 'Degree Flowchart',
    link: 'https://github.com/degree-flowchart',
    image: './degree-flowchart.jpg',
    accent: 'coral',
    tagline: 'Cloud-native degree planning with Angular and Spring Boot microservices',
    desc: 'A cloud-native, distributed degree planner that helps students turn messy course requirements into a clear path to graduation, built with Angular and Spring Boot and load-tested with k6 for real-world scale.',
    metrics: [
      { val: '245ms', label: 'median response (k6)' },
      { val: '100k+', label: 'requests load tested' },
    ],
    stack: ['Angular', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Docker', 'Kubernetes', 'Keycloak', 'k6', 'Prometheus'],
    problem: 'Students had no structured system to visualize and plan their degree path — relying on spreadsheets, manual tracking, and advisor emails to figure out what to take next.',
    approach: 'Built the Angular + TypeScript frontend with a dynamic course planning UI and OAuth-based authentication via Keycloak, connecting distributed Spring Boot microservices with independent PostgreSQL databases through an API gateway. Services containerized with Docker and configured with Kubernetes manifests for AWS deployment.',
    impact: 'k6 load tests sustained 1,000 concurrent users and 100,000+ requests at 245ms median response time with 95%+ success rate.',
    period: 'Sept 2025 - Dec 2025',
  },
  {
    num: '03',
    name: 'IUCAT Library System',
    link: 'https://iucat-library.onrender.com',
    image: './iucat.jpg',
    accent: 'amber',
    tagline: 'Fully deployed library system - live on AWS ECS and Render',
    desc: 'A cloud-deployed library platform built with JavaScript and Spring Boot that makes finding, borrowing, and managing books fast and seamless, with automated workflows, production monitoring, and k6-tested performance at 75 ms average latency.',
    metrics: [
      { val: '75ms', label: 'avg response (k6)' },
      { val: '100%', label: 'success rate under load' },
    ],
    stack: ['Spring Boot', 'AWS ECS Fargate', 'Docker', 'GitHub Actions', 'Prometheus'],
    problem: 'Most student library system projects stop at a basic CRUD API. This one needed to actually work - with real borrowing workflows, queue management, and a deployable setup anyone could use.',
    approach: 'Spring Boot backend with role-based access control, session-based authentication, and transactional borrowing workflows including 14-day rentals, 2x extensions, and an auto-managed holds queue. Deployed to AWS ECS Fargate behind an ALB and Render via a single GitHub Actions pipeline. Structured JSON logging with MDC correlation IDs and Prometheus metrics for observability.',
    impact: 'Live on two platforms. k6 load tests: 100% success rate, 75ms avg and 109ms P95 response across 660 requests. CI/CD pipeline fully automated - push to main deploys everywhere.',
    period: 'Aug 2025 - Oct 2025',
  },
];

const PINNED_REPOS = [
  {
    name: 'hra-ui',
    org: 'hubmapconsortium/hra-ui',
    link: 'https://github.com/hubmapconsortium/hra-ui',
    desc: 'A large-scale Angular + TypeScript UI platform powering the NIH-funded Human Reference Atlas, helping researchers explore and interact with complex biomedical data.',
    stack: ['Angular', 'TypeScript', 'RxJS'],
  },
  {
    name: 'F1-Data-Analysis-Dashboard',
    org: 'gauri2029/F1-Data-Analysis-Dashboard',
    link: 'https://github.com/gauri2029/F1-Data-Analysis-Dashboard',
    desc: 'A Formula 1 analytics dashboard built with Python, Flask, and Plotly that turns race telemetry into interactive insights on pace, strategy, qualifying, and performance.',
    stack: ['Python', 'Flask', 'Plotly'],
  },
  {
    name: 'gauri2029.github.io',
    org: 'gauri2029/gauri2029.github.io',
    link: 'https://github.com/gauri2029/gauri2029.github.io',
    desc: 'A modern Next.js + React portfolio built to showcase my work with polished interactions, responsive design, and a playful Pro/Chaos experience.',
    stack: ['Next.js', 'React', 'Tailwind CSS'],
  },
];

const SKILL_CATEGORIES = [
  {
    name: 'Languages',
    color: 'var(--cyan)',
    grad: 'var(--grad-ct)',
    skills: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL', 'Go', 'PHP'],
  },
  {
    name: 'Frontend',
    color: 'var(--primary)',
    grad: 'var(--grad-pc)',
    skills: ['React', 'Angular', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'RxJS', 'Storybook', 'Figma', 'WCAG'],
  },
  {
    name: 'Backend & APIs',
    color: 'var(--teal)',
    grad: 'var(--grad-tv)',
    skills: ['Node.js', 'Express.js', 'Spring Boot', 'REST APIs', 'GraphQL', 'FastAPI', 'Flask', 'Django'],
  },
  {
    name: 'Data & AI',
    color: 'var(--violet)',
    grad: 'var(--grad-cv)',
    skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'MySQL', 'SQL Server', 'RAG', 'LLM Integration', 'OpenAI API'],
  },
  {
    name: 'Cloud & DevOps',
    color: 'var(--amber)',
    grad: 'var(--grad-ac)',
    skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'CI/CD', 'Prometheus', 'Grafana'],
  },
  {
    name: 'Testing & Tooling',
    color: 'var(--green)',
    grad: 'var(--grad-gt)',
    skills: ['Jest', 'React Testing Library', 'Playwright', 'Selenium', 'Git', 'Cursor', 'GitHub Copilot'],
  },
];

// Strongest/most-used technologies — rendered as emphasized pills.
const CORE_SKILLS = new Set([
  'TypeScript', 'JavaScript', 'Python', 'React', 'Next.js', 'Angular',
  'Node.js', 'Spring Boot', 'AWS', 'Docker', 'PostgreSQL', 'LLM Integration',
]);

const EDUCATION = [
  {
    school: 'Indiana University Bloomington',
    degree: 'M.S. in Computer Science',
    period: 'Aug 2024 - May 2026',
    courses: ['Cloud Computing', 'Computer Networks', 'Software Engineering', 'Applied Algorithms', 'Applied Machine Learning'],
  },
  {
    school: 'Savitribai Phule Pune University',
    degree: 'B.E. in Computer Engineering · Honors in Data Science & Machine Learning',
    period: 'May 2018 - May 2022',
    gpa: '3.8 / 4.0',
    courses: ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Artificial Intelligence', 'Machine Learning'],
  },
];

// ── BOOT LINES ────────────────────────────────────────────────────────────────

const BOOT_LINES = [
  { text: 'GAURI_MARKANDEY_SYS  v4.2.0', cls: 'bright' },
  { text: '─────────────────────────────', cls: '' },
  { text: 'Booting...', cls: '' },
  { text: '[OK] React · Angular · TypeScript', cls: 'green' },
  { text: '[OK] AWS ECS · Docker · Kubernetes', cls: 'green' },
  { text: '[OK] Spring Boot · Node.js · .NET', cls: 'green' },
  { text: '', cls: '' },
  { text: '[MOD] design-system.ko', cls: 'purple' },
  { text: '[MOD] wcag-a11y.ko', cls: 'purple' },
  { text: '[MOD] rag-pipeline.ko', cls: 'purple' },
  { text: '', cls: '' },
  { text: '[OK] experience=2+yrs focus=frontend scope=full-stack+cloud', cls: 'green' },
  { text: '', cls: '' },
  { text: '$ exec portfolio --mode=impress', cls: 'bright' },
];

// ── BOOT SCREEN ───────────────────────────────────────────────────────────────

function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => setFading(true), 400);
        setTimeout(() => { setDone(true); onComplete(); }, 1050);
        return;
      }
      setLines((prev) => [...prev, BOOT_LINES[i]]);
      i++;
    }, 55);
    return () => clearInterval(interval);
  }, [onComplete]);

  if (done) return null;

  return (
    <div className={`boot-screen${fading ? ' fade-out' : ''}`}>
      <div className="boot-inner">
        {lines.map((l, idx) => (
          <div key={idx} className={`boot-line ${l?.cls ?? ''}`}>{l?.text ?? ''}</div>
        ))}
        {!fading && <div className="boot-line"><span className="boot-cursor" /></div>}
      </div>
    </div>
  );
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const isDark = saved ? saved === 'dark' : false;
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {dark ? '☀' : '☾'}
    </button>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar({ mode, updateMode }) {
  return (
    <nav className="navbar">
      <div className="nav-logo" style={{
        fontFamily: 'var(--display)',
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.4))',
      }}>GM</div>
      <ul className="nav-links">
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="nav-right">
        <a href="https://linkedin.com/in/gaurimarkandey" target="_blank" rel="noopener noreferrer" className="nav-icon-link" aria-label="LinkedIn" title="LinkedIn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
        </a>
        <a href="https://github.com/gauri2029" target="_blank" rel="noopener noreferrer" className="nav-icon-link" aria-label="GitHub" title="GitHub">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.49 2.87 8.3 6.84 9.65.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.6-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.04 1.53 1.04.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.71.12 2.5.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.2 10.2 0 0 0 22 12.19C22 6.58 17.52 2 12 2z"/></svg>
        </a>
        <ModeSwitcher mode={mode} updateMode={updateMode} />
        <ThemeToggle />
      </div>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      <div className="hero-inner">
        <div className="hero-layout">
          {/* LEFT — text content */}
          <div className="hero-text">
            <h1 className="hero-name">
              Gauri
              <span className="hero-name-grad">Markandey</span>
            </h1>

            <p className="hero-tagline">
              <strong>Frontend-focused Software Engineer</strong> with{" "}
              <strong>2+ years of experience</strong> building polished user
              interfaces, scalable full-stack applications, and reliable
              cloud-native systems.
            </p>

            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary">
                Get in Touch
              </a>
              <a
                href="https://linkedin.com/in/gaurimarkandey"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://github.com/gauri2029"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                GitHub ↗
              </a>
            </div>
          </div>

          {/* RIGHT — avatar */}
          <div className="hero-avatar-wrap">
            <div className="hero-avatar-glow" />
            <div className="hero-avatar-ring" />
            <div className="hero-avatar-orbit" aria-hidden="true">
              <span className="hero-avatar-orbit-dot dot-a" />
              <span className="hero-avatar-orbit-dot dot-b" />
            </div>
            <div className="hero-badge hero-badge-tl">React</div>
            <div className="hero-badge hero-badge-tr">Spring Boot</div>
            <div className="hero-badge hero-badge-bl">TypeScript</div>
            <div className="hero-badge hero-badge-br">AWS</div>
            <img
              src="/avatar.png"
              alt="Gauri Markandey - software engineer"
              className="hero-avatar-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


// ── EXPERIENCE CARD ───────────────────────────────────────────────────────────

function ExperienceCard({ exp }) {
  const [open, setOpen] = useState(false);
  const [swept, setSwept] = useState(false);
  const bodyId = `exp-body-${exp.company.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  const handleClick = () => {
    setOpen((o) => !o);
    setSwept(true);
    setTimeout(() => setSwept(false), 550);
  };

  return (
    <div className={`exp-card timeline-card glass-card${open ? ' open' : ''}`}>
      {swept && <div className="sweep" />}
      <button type="button" className="exp-header" onClick={handleClick} aria-expanded={open} aria-controls={bodyId}>
        <div>
          <div className="exp-role">{exp.role}</div>
          <div className="exp-company">{exp.company}</div>
          <div className="exp-meta">
            <span>{exp.period}</span>
            <span>{exp.location}</span>
          </div>
        </div>
        <div className="exp-toggle" aria-hidden="true">+</div>
      </button>
      <div className="exp-body-wrap" id={bodyId}>
        <div className="exp-body-inner">
          <div className="exp-body">
            <div className="exp-stack">
              {exp.stack.map((t) => <span key={t} className="tag accent">{t}</span>)}
            </div>
            <ul className="exp-bullets">
              {exp.bullets.map((b, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PROJECT CARD ──────────────────────────────────────────────────────────────

function ProjectCard({ proj, reverse }) {
  const [open, setOpen] = useState(false);
  const tilt = useTilt();
  const bodyId = `project-body-${proj.num}`;
  return (
    <div
      className={`project-card-h glass-card tilt-card accent-${proj.accent}${reverse ? ' reverse' : ''}${open ? ' open' : ''}`}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      <div className="project-card-image">
        <img src={proj.image} alt={`${proj.name} preview`} loading="lazy" />
        <div className="project-num">// {proj.num}</div>
      </div>

      <div className="project-card-content">
        <div className="project-top-row">
          <div className="project-name">{proj.name}</div>
          {proj.link && (
            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link-icon" title="View project">
              ↗
            </a>
          )}
        </div>
        <div className="project-desc">{proj.desc}</div>
        <div className="project-metrics">
          {proj.metrics.map((m) => (
            <div key={m.label} className="metric-box">
              <div className="metric-val">{m.val}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        <button type="button" className="project-expand-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={bodyId}>
          <span>{open ? 'Collapse' : 'See details'}</span>
          <span aria-hidden="true" style={{ display: 'inline-block', transition: 'transform 0.25s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
        </button>

        <div className="project-body-wrap" id={bodyId}>
          <div className="project-body-inner">
            <div className="project-body">
              <div className="project-section-title">Problem</div>
              <p>{proj.problem}</p>
              <div className="project-section-title">Approach</div>
              <p>{proj.approach}</p>
              <div className="project-section-title">Impact</div>
              <p>{proj.impact}</p>
              <div className="project-section-title" style={{ marginTop: 16 }}>Stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                {proj.stack.map((t) => <span key={t} className="tag cyan">{t}</span>)}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{proj.period}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PINNED REPO CARD ──────────────────────────────────────────────────────────

function PinnedCard({ repo }) {
  const tilt = useTilt();
  return (
    <a
      href={repo.link}
      target="_blank"
      rel="noopener noreferrer"
      className="pinned-card glass-card tilt-card"
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      <div className="pinned-top-row">
        <span className="pinned-org">{repo.org}</span>
        <span className="pinned-link-icon" aria-hidden="true">↗</span>
      </div>
      <div className="pinned-name">{repo.name}</div>
      <p className="pinned-desc">{repo.desc}</p>
      <div className="pinned-stack">
        {repo.stack.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    </a>
  );
}

// ── EDUCATION CARD ────────────────────────────────────────────────────────────

function EducationCard({ edu }) {
  return (
    <div className="edu-card timeline-card glass-card">
      <div className="edu-card-accent" />
      <div className="edu-school">{edu.school}</div>
      <div className="edu-degree">{edu.degree}</div>
      <div className="edu-meta">
        <span>{edu.period}</span>
        {edu.gpa && <span>GPA: {edu.gpa}</span>}
      </div>
      {edu.courses.length > 0 && (
        <>
          <div className="edu-courses-label">Coursework</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {edu.courses.map((c) => <span key={c} className="tag">{c}</span>)}
          </div>
        </>
      )}
    </div>
  );
}

// ── SKILL CARD ─────────────────────────────────────────────────────────────────

function SkillCard({ cat }) {
  const tilt = useTilt();
  return (
    <div
      className="skill-card glass-card tilt-card"
      style={{ '--cat-color': cat.color, '--cat-grad': cat.grad }}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      <div className="skill-card-accent" />
      <div className="skill-card-header">
        <span className="skill-card-dot" aria-hidden="true" />
        <h3 className="skill-card-title">{cat.name}</h3>
      </div>
      <div className="skill-pills">
        {cat.skills.map((skill, j) => (
          <span
            key={skill}
            className={`tag skill-pill${CORE_SKILLS.has(skill) ? ' skill-pill-core' : ''}`}
            style={{ transitionDelay: `${0.05 + j * 0.035}s` }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── FADE UP HOOK ──────────────────────────────────────────────────────────────

function useFadeUp() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.fade-up, .slide-left, .slide-right'));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07, rootMargin: '0px 0px -5% 0px' }
    );
    els.forEach((el) => observer.observe(el));

    // Redundant safety net, in case the observer misbehaves: on scroll/resize
    // (rAF-throttled), reveal anything that's actually near the viewport.
    // This deliberately does NOT reveal things that are still far below the
    // fold — a blanket timer that reveals everything a couple seconds after
    // mount defeats the entire point of a scroll-triggered animation, since
    // most visitors haven't scrolled that far yet.
    let ticking = false;
    const revealNearViewport = () => {
      ticking = false;
      const vh = window.innerHeight;
      els.forEach((el) => {
        if (el.classList.contains('visible')) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 1.15 && r.bottom > -vh * 0.15) el.classList.add('visible');
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(revealNearViewport);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    revealNearViewport();

    // True last resort — only matters if both the observer and the scroll
    // listener above have failed (e.g. very old browser), so it's set long
    // enough that it won't spoil the reveal for anyone actually scrolling
    // at a normal pace.
    const hardFallback = setTimeout(() => {
      els.forEach((el) => el.classList.add('visible'));
    }, 15000);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(hardFallback);
    };
  }, []);
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const [booted, setBooted] = useState(false);
  const [flash, setFlash] = useState(false);
  const { mode, updateMode } = useWorldMode();

  const handleModeChange = useCallback((m) => {
    updateMode(m);
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  }, [updateMode]);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  useFadeUp();

  return (
    <>
      <BootScreen onComplete={handleBootComplete} />

      <div className={booted ? 'is-booted' : ''} style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.4s ease' }}>

        <div className={`mode-flash${flash ? ' active' : ''}`} aria-hidden="true" />

        <MotionLayer booted={booted} />
        <Navbar mode={mode} updateMode={handleModeChange} />
        <main>
          <Hero />

          {/* EXPERIENCE */}
          <section id="experience" className="section" style={{ position: 'relative' }}>
            <div className="section-glow section-glow-purple" />
            <div className="section-label fade-up">01</div>
            <h2 className="section-title slide-left">Work Experience</h2>
            <div className="timeline" style={{ paddingLeft: 4 }}>
              {EXPERIENCE.map((exp, i) => (
                <div key={exp.company} className={i % 2 === 0 ? 'slide-left' : 'slide-right'} style={{ transitionDelay: `${i * 0.18}s` }}>
                  <ExperienceCard exp={exp} />
                </div>
              ))}
            </div>
          </section>

          {/* PROJECTS */}
          <section id="projects" className="section" style={{ position: 'relative' }}>
            <div className="section-glow section-glow-cyan" />
            <div className="section-label fade-up">02</div>
            <h2 className="section-title slide-left">Projects</h2>
            <div className="projects-list">
              {PROJECTS.map((p, i) => (
                <div key={p.num} className={i % 2 === 0 ? 'slide-left' : 'slide-right'} style={{ transitionDelay: `${i * 0.16}s` }}>
                  <ProjectCard proj={p} reverse={i % 2 === 1} />
                </div>
              ))}
            </div>

            <h3 className="subsection-title fade-up">More on GitHub</h3>
            <div className="pinned-grid">
              {PINNED_REPOS.map((repo, i) => (
                <div key={repo.org} className="fade-up" style={{ transitionDelay: `${i * 0.12}s` }}>
                  <PinnedCard repo={repo} />
                </div>
              ))}
            </div>
          </section>

          {/* SKILLS */}
          <section id="skills" className="section" style={{ position: 'relative' }}>
            <div className="section-glow section-glow-teal" />
            <div className="section-label fade-up">03</div>
            <h2 className="section-title slide-left">Skills</h2>
            <p className="skills-intro fade-up">
              Languages, frameworks, and tools I reach for most - core strengths stand out.
            </p>
            <div className="skills-grid">
              {SKILL_CATEGORIES.map((cat, i) => (
                <div key={cat.name} className="fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <SkillCard cat={cat} />
                </div>
              ))}
            </div>
          </section>

          {/* EDUCATION */}
          <section id="education" className="section">
            <div className="section-label fade-up">04</div>
            <h2 className="section-title slide-left">Education</h2>
            <div className="timeline" style={{ paddingLeft: 4 }}>
              {EDUCATION.map((e, i) => (
                <div key={e.school} className={i % 2 === 0 ? 'slide-left' : 'slide-right'} style={{ transitionDelay: `${i * 0.18}s` }}>
                  <EducationCard edu={e} />
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact">
            <div className="contact-section">
              <h2 className="contact-title fade-up">Let's connect</h2>
              <div className="contact-links fade-up">
                <a href="mailto:gauri2029@gmail.com" className="contact-link">✉ gauri2029@gmail.com</a>
              </div>
            </div>
          </section>
        </main>

        <footer>
          <span style={{ fontWeight: 600 }}>Gauri Markandey</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>
            © 2026 · Built with Next.js & Tailwind CSS
          </span>
        </footer>
      </div>
    </>
  );
}
