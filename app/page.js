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

  const isCapable = () => {
    if (capable.current === null) {
      capable.current =
        typeof window !== 'undefined' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return capable.current;
  };

  const onMouseMove = useCallback((e) => {
    if (!isCapable()) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--tilt-x', `${((py - 0.5) * -6).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${((px - 0.5) * 8).toFixed(2)}deg`);
    el.style.setProperty('--glow-x', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--glow-y', `${(py * 100).toFixed(1)}%`);
  }, []);

  const onMouseLeave = useCallback((e) => {
    const el = e.currentTarget;
    el.style.removeProperty('--tilt-x');
    el.style.removeProperty('--tilt-y');
  }, []);

  return { onMouseMove, onMouseLeave };
}

// ── STAR FIELD ────────────────────────────────────────────────────────────────
// Plain <canvas> + requestAnimationFrame — no charting/animation library.
// A slow hyperspace-style drift of dots outward from center. Respects
// prefers-reduced-motion (draws one static frame and stops) and re-tints
// itself for the active theme by reading the data-theme attribute each frame.

function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let stars = [];
    const STAR_COUNT = 130;

    const makeStar = () => ({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: STAR_COUNT }, makeStar);
    };
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = dark ? 'rgba(226,232,255,0.9)' : 'rgba(76,111,255,0.4)';
      for (const s of stars) {
        if (!reduceMotion) {
          s.z -= 1.6;
          if (s.z <= 1) Object.assign(s, makeStar(), { z: w });
        }
        const k = 128 / s.z;
        const sx = s.x * k + cx;
        const sy = s.y * k + cy;
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
        const size = Math.max(0.4, (1 - s.z / w) * 2.2);
        ctx.globalAlpha = Math.max(0.12, 1 - s.z / w);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
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
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas className="starfield" ref={canvasRef} aria-hidden="true" />;
}

// ── MOTION LAYER ──────────────────────────────────────────────────────────────

function MotionLayer() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef(null);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let onMove;
    if (canHover) {
      onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
      const tick = () => {
        if (cursorRef.current) {
          cursorRef.current.style.left = pos.current.x + 'px';
          cursorRef.current.style.top = pos.current.y + 'px';
        }
        raf.current = requestAnimationFrame(tick);
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      raf.current = requestAnimationFrame(tick);
    }

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
      if (onMove) window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onParallax);
      if (raf.current) cancelAnimationFrame(raf.current);
      glowObserver.disconnect();
    };
  }, []);

  return (
    <>
      <StarField />
      <div className="dot-grid" aria-hidden="true" />
      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />
    </>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
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
];

const PROJECTS = [
  {
    num: '01',
    name: 'DocuQuery',
    link: 'https://github.com/gauri2029/docuquery',
    image: 'https://loremflickr.com/640/480/artificialintelligence,circuitboard',
    accent: 'cobalt',
    tagline: 'AI-powered documentation assistant for developers',
    desc: 'A secure, self-hosted assistant that lets developers query internal docs in plain English and get source-cited answers instantly — built to keep sensitive documentation off third-party servers.',
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
    image: 'https://loremflickr.com/640/480/graduation,university',
    accent: 'coral',
    tagline: 'Cloud-native degree planning with Angular and Spring Boot microservices',
    desc: 'A distributed degree planning platform with a dynamic Angular UI, OAuth-based authentication via Keycloak, schedule exports, and a microservices backend built to scale under real load.',
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
    image: 'https://loremflickr.com/640/480/library,bookshelf',
    accent: 'amber',
    tagline: 'Fully deployed library system - live on AWS ECS and Render',
    desc: 'A production-deployed library platform with book rentals, holds queue, AJAX search, and full observability - not just a backend exercise.',
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
    desc: 'HRA UIs monorepo powering the NIH-funded Human Reference Atlas — HRA Portal, EUI, RUI, ASCT+B Reporter, and more.',
    stack: ['Angular', 'TypeScript', 'RxJS'],
  },
  {
    name: 'F1-Data-Analysis-Dashboard',
    org: 'gauri2029/F1-Data-Analysis-Dashboard',
    link: 'https://github.com/gauri2029/F1-Data-Analysis-Dashboard',
    desc: 'Interactive Formula 1 analytics dashboard with Flask, Plotly, FastF1, and SQLite-backed data visualizations.',
    stack: ['Python', 'Flask', 'Plotly'],
  },
  {
    name: 'gauri2029.github.io',
    org: 'gauri2029/gauri2029.github.io',
    link: 'https://github.com/gauri2029/gauri2029.github.io',
    desc: 'Source for this portfolio — Next.js App Router and Tailwind CSS, with a glassmorphism design system and Pro/Chaos modes.',
    stack: ['Next.js', 'React', 'Tailwind CSS'],
  },
];

const EDUCATION = [
  {
    school: 'Savitribai Phule Pune University',
    degree: 'B.E. in Computer Engineering · Honors in Data Science & Machine Learning',
    period: 'May 2018 - May 2022',
    gpa: '3.8 / 4.0',
    courses: ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Artificial Intelligence', 'Machine Learning'],
  },
  {
    school: 'Indiana University Bloomington',
    degree: 'M.S. in Computer Science',
    period: 'Aug 2024 - May 2026',
    courses: ['Cloud Computing', 'Computer Networks', 'Software Engineering', 'Applied Algorithms', 'Applied Machine Learning'],
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
  { text: '[OK] experience=3yrs focus=frontend scope=full-stack+cloud', cls: 'green' },
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
        filter: 'drop-shadow(0 0 8px rgba(76,141,255,0.4))',
      }}>GM</div>
      <ul className="nav-links">
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
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
              <span className="hero-name-grad">Markandey.</span>
            </h1>

            <p className="hero-tagline">
              <strong>Frontend-focused Software Engineer</strong> with <strong>3 years of professional experience</strong> across
              full-stack and cloud-native systems - building pixel-perfect UIs, design systems, and production
              infrastructure that handles real load.
            </p>

            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary">Get in Touch</a>
              <a href="https://linkedin.com/in/gaurimarkandey" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">LinkedIn ↗</a>
              <a href="https://github.com/gauri2029" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">GitHub ↗</a>
            </div>

            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="hero-meta-label">Education</span>
                <span className="hero-meta-value">M.S. CS · Indiana University Bloomington — May 2026</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Looking for</span>
                <span className="hero-meta-value">Frontend SWE · full-stack &amp; cloud</span>
              </div>
            </div>
          </div>

          {/* RIGHT — avatar */}
          <div className="hero-avatar-wrap">
            <div className="hero-avatar-glow" />
            <div className="hero-avatar-ring" />
            <div className="hero-badge hero-badge-tl">React</div>
            <div className="hero-badge hero-badge-tr">Spring Boot</div>
            <div className="hero-badge hero-badge-bl">TypeScript</div>
            <div className="hero-badge hero-badge-br">AWS</div>
            <img src="/avatar.png" alt="Gauri Markandey - software engineer" className="hero-avatar-img" />
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

// ── FADE UP HOOK ──────────────────────────────────────────────────────────────

function useFadeUp() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up, .slide-left, .slide-right');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07, rootMargin: '0px 0px -5% 0px' }
    );
    els.forEach((el) => observer.observe(el));

    // Safety net: content must never stay hidden if the observer is slow,
    // unsupported, or a card never crosses the threshold (e.g. a very short
    // viewport). Force-reveal anything still unrevealed after a short delay.
    const fallback = setTimeout(() => {
      els.forEach((el) => el.classList.add('visible'));
    }, 2500);

    return () => { observer.disconnect(); clearTimeout(fallback); };
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

      <div style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.9s ease' }}>

        <div className={`mode-flash${flash ? ' active' : ''}`} aria-hidden="true" />

        <MotionLayer />
        <Navbar mode={mode} updateMode={handleModeChange} />
        <main>
          <Hero />

          <hr className="section-divider" />

          {/* EXPERIENCE */}
          <section id="experience" className="section" style={{ position: 'relative' }}>
            <div className="section-glow section-glow-purple" />
            <div className="section-label fade-up">01</div>
            <h2 className="section-title slide-left">Work Experience</h2>
            <div className="timeline" style={{ paddingLeft: 4 }}>
              {EXPERIENCE.map((exp, i) => (
                <div key={exp.company} className="fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <ExperienceCard exp={exp} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* PROJECTS */}
          <section id="projects" className="section" style={{ position: 'relative' }}>
            <div className="section-glow section-glow-cyan" />
            <div className="section-label fade-up">02</div>
            <h2 className="section-title slide-left">Projects</h2>
            <div className="projects-list">
              {PROJECTS.map((p, i) => (
                <div key={p.num} className={i % 2 === 0 ? 'slide-left' : 'slide-right'} style={{ transitionDelay: `${i * 0.08}s` }}>
                  <ProjectCard proj={p} reverse={i % 2 === 1} />
                </div>
              ))}
            </div>

            <h3 className="subsection-title fade-up">More on GitHub</h3>
            <div className="pinned-grid">
              {PINNED_REPOS.map((repo, i) => (
                <div key={repo.org} className="fade-up" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <PinnedCard repo={repo} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* EDUCATION */}
          <section id="education" className="section">
            <div className="section-label fade-up">03</div>
            <h2 className="section-title slide-left">Education</h2>
            <div className="timeline" style={{ paddingLeft: 4 }}>
              {EDUCATION.map((e, i) => (
                <div key={e.school} className="fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <EducationCard edu={e} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* CONTACT */}
          <section id="contact">
            <div className="contact-section">
              <h2 className="contact-title fade-up">
                Let's ship<br /><span>something real.</span>
              </h2>
              <p className="contact-sub fade-up">
                M.S. in Computer Science, Indiana University Bloomington — May 2026. Open to Frontend Software Engineer roles with full-stack and cloud scope.
              </p>
              <div className="contact-links fade-up">
                <a href="mailto:gauri2029@gmail.com" className="contact-link">✉ gauri2029@gmail.com</a>
                <a href="https://linkedin.com/in/gaurimarkandey" target="_blank" rel="noopener noreferrer" className="contact-link">↗ LinkedIn</a>
                <a href="https://github.com/gauri2029" target="_blank" rel="noopener noreferrer" className="contact-link">⌥ GitHub</a>
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
