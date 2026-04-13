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
          className={`mode-btn${mode === m.id ? ' active' : ''}`}
          onClick={() => updateMode(m.id)}
          title={m.title}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── MOTION LAYER ──────────────────────────────────────────────────────────────

function MotionLayer() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef(null);

  useEffect(() => {
    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      if (cursorRef.current) {
        cursorRef.current.style.left = pos.current.x + 'px';
        cursorRef.current.style.top = pos.current.y + 'px';
      }
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

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
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onParallax);
      cancelAnimationFrame(raf.current);
      glowObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="dot-grid" aria-hidden="true" />
      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />
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

const EXPERTISE = [
  {
    accent: 'p-cyan',
    icon: '⬡',
    name: 'Frontend Engineering',
    desc: 'Design systems, component architecture, performance optimization, WCAG accessibility.',
    chips: ['React', 'Angular', 'Next.js', 'TypeScript', 'RxJS', 'Storybook'],
    skills: [
      { name: 'React / Next.js', pct: 95 },
      { name: 'Angular / RxJS', pct: 90 },
      { name: 'TypeScript', pct: 90 },
      { name: 'Design Systems', pct: 85 },
    ],
  },
  {
    accent: 'p-amber',
    icon: '◈',
    name: 'Backend & APIs',
    desc: 'REST APIs, microservices, Spring Boot, secure auth flows, transactional databases.',
    chips: ['Spring Boot', 'C#/.NET', 'Node.js', 'PostgreSQL', 'JWT', 'RAG / LLM'],
    skills: [
      { name: 'Node.js', pct: 88 },
      { name: 'Spring Boot', pct: 82 },
      { name: 'C# / .NET', pct: 82 },
      { name: 'PostgreSQL / SQL', pct: 80 },
      { name: 'RAG / LLM', pct: 72 },
    ],
  },
  {
    accent: 'p-green',
    icon: '◎',
    name: 'Cloud & DevOps',
    desc: 'AWS, Azure, Docker, CI/CD pipelines, infrastructure as code, observability stacks.',
    chips: ['AWS ECS', 'Docker', 'GitHub Actions', 'Azure DevOps', 'Terraform', 'Kubernetes'],
    skills: [
      { name: 'Docker', pct: 84 },
      { name: 'CI/CD', pct: 88 },
      { name: 'AWS ECS / Fargate', pct: 80 },
      { name: 'Azure DevOps', pct: 78 },
      { name: 'Kubernetes', pct: 68 },
    ],
  },
  {
    accent: 'p-pink',
    icon: '⬢',
    name: 'Testing & Quality',
    desc: 'Full-stack coverage, accessibility auditing, E2E automation, CI-enforced quality gates.',
    chips: ['Jest', 'React Testing Library', 'Selenium', 'NUnit', 'xUnit', 'WCAG'],
    skills: [
      { name: 'Jest / RTL', pct: 90 },
      { name: 'Accessibility (WCAG)', pct: 85 },
      { name: 'E2E (Selenium)', pct: 80 },
      { name: 'NUnit / xUnit', pct: 82 },
    ],
  },
];

const EDUCATION = [
  {
    school: 'Indiana University Bloomington',
    degree: 'M.S. in Computer Science',
    period: 'Expected Graduation: May 2026',
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
  { text: '[WARN] new_grad=true ship_anyway=true', cls: 'red' },
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
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const isDark = saved ? saved === 'dark' : true;
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
        background: 'linear-gradient(135deg, #7C5CFF, #22D3EE)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '-0.02em',
        filter: 'drop-shadow(0 0 8px rgba(124,92,255,0.4))',
      }}>GM</div>
      <ul className="nav-links">
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#expertise">Expertise</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="nav-right">
        <div className="nav-status">
          <div className="status-dot" />
          Open to work
        </div>
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
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              new_grad=true · available=may_2026
            </div>

            <h1 className="hero-name">
              Gauri
              <span className="hero-name-grad">Markandey.</span>
            </h1>

            <p className="hero-tagline">
              Software engineer with <strong>2+ years in production</strong> -
              building pixel-perfect UIs, design systems, and cloud-native backends
              that handle real load.
            </p>

            <div className="hero-cta">
              <a href="https://drive.google.com/file/d/18Sqk9BWoF2OWuwOGDjTkC_3rtmnv5JB6/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Resume →</a>
              <a href="#contact" className="btn btn-ghost">Get in Touch</a>
              <a href="https://linkedin.com/in/gaurimarkandey" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">LinkedIn ↗</a>
            </div>

            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="hero-meta-label">Currently</span>
                <span className="hero-meta-value">M.S. CS · Indiana University</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Looking for</span>
                <span className="hero-meta-value">SWE roles · New Grad 2026</span>
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

  const handleClick = () => {
    setOpen((o) => !o);
    setSwept(true);
    setTimeout(() => setSwept(false), 550);
  };

  return (
    <div className={`exp-card${open ? ' open' : ''}`}>
      {swept && <div className="sweep" />}
      <div className="exp-header" onClick={handleClick}>
        <div>
          <div className="exp-role">{exp.role}</div>
          <div className="exp-company">{exp.company}</div>
          <div className="exp-meta">
            <span>{exp.period}</span>
            <span>{exp.location}</span>
          </div>
        </div>
        <div className="exp-toggle">+</div>
      </div>
      <div className="exp-body-wrap">
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

function ProjectCard({ proj }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`project-card${open ? ' open' : ''}`}>
      <div className="project-header">
        <div className="project-top-row">
          <div className="project-num">// {proj.num}</div>
          {proj.link && (
            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link-icon" title="View project">
              ↗
            </a>
          )}
        </div>
        <div className="project-name">{proj.name}</div>
        <div className="project-desc">{proj.desc}</div>
        <div className="project-metrics">
          {proj.metrics.map((m) => (
            <div key={m.label} className="metric-box">
              <div className="metric-val">{m.val}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="project-expand-btn" onClick={() => setOpen((o) => !o)}>
        <span>{open ? 'Collapse' : 'See details'}</span>
        <span style={{ display: 'inline-block', transition: 'transform 0.25s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>

      <div className="project-body-wrap">
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
  );
}

// ── EXPERTISE CARD ────────────────────────────────────────────────────────────

function ExpertiseCard({ card }) {
  const [swept, setSwept] = useState(false);
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    setSwept(true);
    setTimeout(() => setSwept(false), 550);
  };

  return (
    <div ref={ref} className={`expertise-card ${card.accent}`} onClick={handleClick}>
      {swept && <div className="sweep" />}
      <span className="expertise-icon">{card.icon}</span>
      <div className="expertise-name">{card.name}</div>
      <div className="expertise-desc">{card.desc}</div>
      <div className="skill-chips">
        {card.chips.map((c) => <span key={c} className="skill-chip">{c}</span>)}
      </div>
      <div className="skill-bars">
        {card.skills.map((s) => (
          <div key={s.name} className="skill-bar-item">
            <span className="skill-bar-name">{s.name}</span>
            <div className="skill-bar-track">
              <div className="skill-bar-fill" style={{ width: animated ? `${s.pct}%` : '0%' }} />
            </div>
            <span className="skill-bar-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EDUCATION CARD ────────────────────────────────────────────────────────────

function EducationCard({ edu }) {
  return (
    <div className="edu-card">
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
    const els = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
            <h2 className="section-title fade-up">Work Experience</h2>
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
            <h2 className="section-title fade-up">Projects</h2>
            <div className="projects-grid">
              {PROJECTS.map((p, i) => (
                <div key={p.num} className="fade-up" style={{ transitionDelay: `${i * 0.09}s` }}>
                  <ProjectCard proj={p} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* EXPERTISE */}
          <section id="expertise" className="section" style={{ position: 'relative' }}>
            <div className="section-glow section-glow-purple" />
            <div className="section-label fade-up">03</div>
            <h2 className="section-title fade-up">Technical Expertise</h2>
            <div className="expertise-grid">
              {EXPERTISE.map((card, i) => (
                <div key={card.name} className="fade-up" style={{ transitionDelay: `${i * 0.07}s` }}>
                  <ExpertiseCard card={card} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* EDUCATION */}
          <section id="education" className="section">
            <div className="section-label fade-up">04</div>
            <h2 className="section-title fade-up">Education</h2>
            <div className="edu-grid">
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
                Graduating May 2026, available now. Looking for full-stack, frontend, or backend SWE roles where the work actually matters.
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
