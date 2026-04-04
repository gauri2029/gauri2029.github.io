'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── DATA ──────────────────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    role: 'Software Developer 2',
    company: 'Cyberinfrastructure for Network Science Center (CNS)',
    location: 'Bloomington, IN',
    period: 'Jan 2025 – Jan 2026',
    stack: ['Angular', 'TypeScript', 'RxJS', 'AWS S3', 'Jest', 'GitHub Actions'],
    bullets: [
      '<strong>Architected & refactored</strong> Angular + TypeScript frontend integrating AWS S3 and shared design system; reduced dev overhead ~20%.',
      '<strong>Optimized RxJS data flows</strong> across critical user journeys, cutting redundant requests ~20% and improving responsiveness.',
      '<strong>Owned production stability</strong> for NIH-funded Human Reference Atlas — zero critical user-facing disruptions across the release cycle.',
      '<strong>Maintained CI/CD pipelines</strong> via GitHub Actions, reducing build and release friction ~25%.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Tietoevry India Pvt. Ltd.',
    location: 'Pune, India',
    period: 'Jul 2022 – Jun 2024',
    stack: ['React', 'C#', '.NET', 'Node.js', 'Docker', 'Azure', 'Storybook', 'Selenium'],
    bullets: [
      '<strong>Led Angular → React migration</strong> across a large-scale healthcare frontend — reduced build complexity across 6–7 microservices on Azure.',
      '<strong>Built reusable component libraries</strong> with React + Storybook + Figma, cutting frontend effort ~35%.',
      '<strong>Owned full-stack testing</strong> — Jest, RTL, Selenium, NUnit, xUnit — maintaining 80%+ code coverage in a regulated environment.',
      '<strong>Built Node.js/.NET REST APIs</strong> powering 6–7 feature-based microservices with secure auth and access controls.',
      '<strong>CI/CD with Azure DevOps + Docker</strong> reduced production incidents ~35% and improved release consistency.',
    ],
  },
];

const PROJECTS = [
  {
    num: '01',
    name: 'DocuQuery',
    tagline: 'RAG-powered REST API with semantic search',
    desc: 'An embed → retrieve → generate pipeline with source-cited answers and sub-second latency.',
    metrics: [
      { val: 'P95', label: 'sub-second latency' },
      { val: '5', label: 'orchestrated services' },
    ],
    stack: ['Spring Boot', 'OpenAI', 'ChromaDB', 'PostgreSQL', 'Docker', 'Prometheus', 'Grafana'],
    problem: 'RAG pipelines often lack production-grade observability or degrade under load.',
    approach: 'Semantic search pipeline over ChromaDB with prompt-constrained LLM responses. 5 services containerized via Docker Compose with full metric instrumentation.',
    impact: 'P95 latency under 1s. Micrometer metrics covering P50/P95/P99 latency, error rates, throughput, and health checks.',
    period: 'Dec 2025 – Jan 2026',
  },
  {
    num: '02',
    name: 'Degree Flowchart',
    tagline: 'Cloud-native microservices on AWS ECS',
    desc: 'Scalable degree planning system with 7 independent Spring Boot services, load-tested at 1,000+ concurrent users.',
    metrics: [
      { val: '245ms', label: 'median response time' },
      { val: '100k+', label: 'requests sustained' },
    ],
    stack: ['Spring Boot', 'AWS ECS Fargate', 'Kubernetes', 'PostgreSQL', 'Docker', 'Prometheus', 'k6'],
    problem: 'Degree planning systems often live as monoliths — hard to scale, harder to maintain.',
    approach: '7 Spring Boot microservices with independent PostgreSQL databases. Deployed to AWS ECS Fargate with k6 load testing at scale.',
    impact: '1,000 concurrent users, 100k+ requests at 245ms median and 95%+ success rate under load.',
    period: 'Sept 2025 – Dec 2025',
  },
  {
    num: '03',
    name: 'IUCAT Library System',
    tagline: 'Production-grade backend on AWS ECS',
    desc: 'JWT-authenticated backend with zero-downtime deployments behind an Application Load Balancer.',
    metrics: [
      { val: '~75ms', label: 'avg response time' },
      { val: 'zero', label: 'downtime deploys' },
    ],
    stack: ['Spring Boot', 'AWS ECS Fargate', 'PostgreSQL', 'Docker', 'GitHub Actions', 'ALB'],
    problem: 'Library systems need strict transactional integrity for borrowing workflows and secure role-based access.',
    approach: 'JWT authentication, RBAC, and secure REST APIs. Deployed behind an ALB with CI/CD via GitHub Actions.',
    impact: '~75ms average response under concurrent access, zero-downtime deployments fully automated.',
    period: 'Aug 2025 – Oct 2025',
  },
];

const EXPERTISE = [
  {
    color: 'orange',
    icon: '◈',
    name: 'Frontend Engineering',
    desc: 'Design systems, component architecture, performance optimization, WCAG accessibility.',
    chips: ['React', 'Angular', 'Next.js', 'TypeScript', 'RxJS', 'Storybook'],
    skills: [
      { name: 'React / Next.js', pct: 95 },
      { name: 'Angular', pct: 90 },
      { name: 'TypeScript', pct: 90 },
      { name: 'Design Systems', pct: 85 },
    ],
  },
  {
    color: 'purple',
    icon: '◉',
    name: 'Testing & Quality',
    desc: 'Full-stack coverage, accessibility auditing, E2E automation, CI-enforced quality gates.',
    chips: ['Jest', 'React Testing Library', 'Selenium', 'NUnit', 'xUnit', 'WCAG'],
    skills: [
      { name: 'Jest / RTL', pct: 90 },
      { name: 'Accessibility', pct: 85 },
      { name: 'E2E (Selenium)', pct: 80 },
      { name: 'Coverage >80%', pct: 85 },
    ],
  },
  {
    color: 'amber',
    icon: '◎',
    name: 'Backend & APIs',
    desc: 'REST APIs, microservices, Spring Boot, Node.js, secure auth flows, SQL databases.',
    chips: ['Spring Boot', 'Node.js', 'C#/.NET', 'PostgreSQL', 'GraphQL', 'JWT'],
    skills: [
      { name: 'Spring Boot', pct: 82 },
      { name: 'Node.js / .NET', pct: 80 },
      { name: 'REST / GraphQL', pct: 85 },
      { name: 'PostgreSQL', pct: 78 },
    ],
  },
  {
    color: 'blue',
    icon: '◐',
    name: 'Cloud & DevOps',
    desc: 'AWS ECS Fargate, Docker, Kubernetes, CI/CD pipelines, observability stacks.',
    chips: ['AWS ECS', 'Docker', 'Kubernetes', 'GitHub Actions', 'Azure DevOps', 'Prometheus'],
    skills: [
      { name: 'AWS / Docker', pct: 84 },
      { name: 'CI/CD Pipelines', pct: 88 },
      { name: 'Kubernetes', pct: 72 },
      { name: 'Observability', pct: 78 },
    ],
  },
  {
    color: 'red',
    icon: '◑',
    name: 'Systems & Architecture',
    desc: 'Microservice design, RAG pipelines, load testing at scale, data isolation.',
    chips: ['Microservices', 'RAG / LLM', 'k6 Load Testing', 'ChromaDB', 'Grafana'],
    skills: [
      { name: 'Microservices', pct: 85 },
      { name: 'LLM / RAG', pct: 76 },
      { name: 'Load Testing', pct: 74 },
      { name: 'Observability', pct: 78 },
    ],
  },
];

const EDUCATION = [
  {
    school: 'Indiana University Bloomington',
    degree: 'M.S. in Computer Science',
    period: 'Expected May 2026',
    courses: ['Computer Networks', 'Software Engineering', 'Cloud Computing', 'Applied Algorithms', 'Applied Machine Learning'],
  },
  {
    school: 'Savitribai Phule Pune University',
    degree: 'B.E. in Computer Science',
    period: 'May 2018 – May 2022',
    gpa: '3.8 / 4.0',
    courses: [],
  },
];

// ── BOOT LINES ────────────────────────────────────────────────────────────────

const BOOT_LINES = [
  { text: 'BIOS v4.2.0 — GAURI_MARKANDEY_SYS', cls: 'bright' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', cls: '' },
  { text: 'Initializing hardware...', cls: '' },
  { text: '  [OK]  CPU: Frontend Engineering Core × 3yrs', cls: 'green' },
  { text: '  [OK]  RAM: React, Angular, TypeScript, Next.js', cls: 'green' },
  { text: '  [OK]  NET: REST APIs, GraphQL, Spring Boot', cls: 'green' },
  { text: '  [OK]  STO: AWS ECS, Docker, Kubernetes', cls: 'green' },
  { text: '', cls: '' },
  { text: 'Loading modules...', cls: '' },
  { text: '  [MOD] design-system.ko — loaded', cls: 'purple' },
  { text: '  [MOD] wcag-accessibility.ko — loaded', cls: 'purple' },
  { text: '  [MOD] microservices-arch.ko — loaded', cls: 'purple' },
  { text: '  [MOD] rag-pipeline.ko — loaded', cls: 'purple' },
  { text: '', cls: '' },
  { text: '  [WARN] new_grad=true, ship_anyway=true', cls: 'red' },
  { text: '', cls: '' },
  { text: 'System ready.', cls: 'green' },
  { text: '$ exec portfolio --mode=impress', cls: 'bright' },
];

// ── TERMINAL COMMANDS ─────────────────────────────────────────────────────────

const TERMINAL_COMMANDS = {
  help: [
    { cls: 't-ok',   text: 'Available commands:' },
    { cls: 't-out',  text: '  skills    → all skills overview' },
    { cls: 't-out',  text: '  frontend  → frontend expertise' },
    { cls: 't-out',  text: '  backend   → backend & APIs' },
    { cls: 't-out',  text: '  cloud     → cloud & DevOps' },
    { cls: 't-out',  text: '  projects  → project list' },
    { cls: 't-out',  text: '  contact   → contact info' },
    { cls: 't-out',  text: '  clear     → clear terminal' },
  ],
  skills: [
    { cls: 't-ok',   text: '── Frontend' },
    { cls: 't-out',  text: '  React, Angular, Next.js, TypeScript, RxJS' },
    { cls: 't-ok',   text: '── Backend' },
    { cls: 't-out',  text: '  Spring Boot, Node.js, C#/.NET, PostgreSQL' },
    { cls: 't-ok',   text: '── Cloud' },
    { cls: 't-out',  text: '  AWS ECS, Docker, Kubernetes, GitHub Actions' },
    { cls: 't-ok',   text: '── Testing' },
    { cls: 't-out',  text: '  Jest, RTL, Selenium, NUnit — 80%+ coverage' },
  ],
  frontend: [
    { cls: 't-ok',   text: 'Frontend expertise:' },
    { cls: 't-info', text: '  React / Next.js    ████████████ 95%' },
    { cls: 't-info', text: '  Angular + RxJS     ███████████  90%' },
    { cls: 't-info', text: '  TypeScript         ███████████  90%' },
    { cls: 't-info', text: '  Design Systems     ██████████   85%' },
    { cls: 't-info', text: '  WCAG Accessibility ██████████   85%' },
  ],
  backend: [
    { cls: 't-ok',   text: 'Backend & APIs:' },
    { cls: 't-warn', text: '  Spring Boot REST   ██████████   82%' },
    { cls: 't-warn', text: '  Node.js            ████████████ 80%' },
    { cls: 't-warn', text: '  C# / .NET          ████████     78%' },
    { cls: 't-warn', text: '  PostgreSQL         ████████     78%' },
    { cls: 't-out',  text: '  JWT, RBAC, input validation, secure auth' },
  ],
  cloud: [
    { cls: 't-ok',   text: 'Cloud & DevOps:' },
    { cls: 't-info', text: '  AWS ECS Fargate    ██████████   84%' },
    { cls: 't-info', text: '  Docker + Compose   ██████████   84%' },
    { cls: 't-info', text: '  CI/CD Pipelines    ███████████  88%' },
    { cls: 't-info', text: '  Kubernetes         █████████    72%' },
    { cls: 't-info', text: '  Prometheus/Grafana █████████    78%' },
  ],
  projects: [
    { cls: 't-ok',   text: 'Projects:' },
    { cls: 't-out',  text: '  01  DocuQuery      — RAG API, P95 <1s' },
    { cls: 't-out',  text: '  02  Degree Chart   — AWS ECS, 100k+ req' },
    { cls: 't-out',  text: '  03  IUCAT Library  — ~75ms avg response' },
  ],
  contact: [
    { cls: 't-ok',   text: 'Contact:' },
    { cls: 't-info', text: '  email    gauri2029@gmail.com' },
    { cls: 't-info', text: '  linkedin linkedin.com/in/gaurimarkandey' },
    { cls: 't-info', text: '  github   github.com/gauri2029' },
    { cls: 't-out',  text: '  available May 2026 · US authorized' },
  ],
};

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
        setTimeout(() => { setDone(true); onComplete(); }, 1000);
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
      <div style={{ width: '100%', maxWidth: 520 }}>
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

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">gauri@portfolio:~$</div>
      <ul className="nav-links">
        <li><a href="#experience">Experience</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#expertise">Expertise</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="nav-right">
        <div className="nav-status">
          <div className="status-dot" />
          Available May 2026
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-eyebrow">Software Engineer · New Grad May 2026 · US Authorized</div>

        <h1 className="hero-name">
          Gauri
          <span>Markandey.</span>
        </h1>

        <p className="hero-tagline">
          I build <strong>frontend systems</strong>, not just interfaces —
          from design systems and accessible UIs to cloud-native microservices at production scale.
        </p>

        <div className="hero-cta">
          <a href="#projects" className="btn btn-primary">View Projects →</a>
          <a href="#contact" className="btn btn-ghost">Get in Touch</a>
          <a href="https://linkedin.com/in/gaurimarkandey" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">LinkedIn ↗</a>
        </div>

        <div className="hero-meta">
          <div className="hero-meta-item">
            <span className="hero-meta-label">Experience</span>
            <span className="hero-meta-value">3+ Years Production</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Primary Stack</span>
            <span className="hero-meta-value">React · Angular · TypeScript</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Cloud</span>
            <span className="hero-meta-value">AWS · Docker · Kubernetes</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Location</span>
            <span className="hero-meta-value">Bloomington, IN (Open to Relocation)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── INTERACTIVE TERMINAL ──────────────────────────────────────────────────────

const INITIAL_OUTPUT = [
  { cls: 't-ok',  text: 'gauri-terminal v1.0 — type "help" for commands' },
  { cls: 't-out', text: '' },
];

function TerminalSection() {
  const [open, setOpen] = useState(false);
  const [output, setOutput] = useState(INITIAL_OUTPUT);
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [output]);

  const run = useCallback((cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === 'clear') { setOutput(INITIAL_OUTPUT); return; }
    const response = TERMINAL_COMMANDS[trimmed];
    if (response) {
      setOutput((prev) => [...prev, { isCmd: true, text: trimmed }, ...response, { cls: 't-out', text: '' }]);
    } else if (trimmed !== '') {
      setOutput((prev) => [
        ...prev,
        { isCmd: true, text: trimmed },
        { cls: 't-out', text: `command not found: "${trimmed}". Try "help".` },
        { cls: 't-out', text: '' },
      ]);
    }
  }, []);

  const onKey = (e) => {
    if (e.key === 'Enter') { run(input); setInput(''); }
  };

  return (
    <div className="terminal-section">
      <div className="terminal-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>// interactive terminal</span>
        </div>
        <button
          className="terminal-toggle-btn"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) setTimeout(() => inputRef.current?.focus(), 400);
          }}
        >
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{open ? '▲ collapse' : '▼ expand'}</span>
        </button>
      </div>

      <div
        className="terminal-wrap"
        style={{
          maxHeight: open ? 420 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          borderWidth: open ? 1 : 0,
        }}
      >
        <div className="terminal-bar">
          <div className="terminal-dot" style={{ background: '#ef4444' }} />
          <div className="terminal-dot" style={{ background: '#f59e0b' }} />
          <div className="terminal-dot" style={{ background: '#22c55e' }} />
          <span className="terminal-title">gauri — zsh</span>
        </div>

        <div className="terminal-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
          {output.map((line, i) =>
            line.isCmd ? (
              <div key={i} className="t-line">
                <span className="t-prompt">❯</span>
                <span className="t-cmd">{line.text}</span>
              </div>
            ) : (
              <span key={i} className={line.cls}>{line.text}</span>
            )
          )}
        </div>

        <div className="terminal-input-row">
          <span className="t-prompt">❯</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="type a command..."
            autoComplete="off"
            spellCheck={false}
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  );
}

// ── EXPERIENCE CARD ───────────────────────────────────────────────────────────

function ExperienceCard({ exp }) {
  const [open, setOpen] = useState(false);
  const [swept, setSwept] = useState(false);

  const handleClick = () => {
    setOpen((o) => !o);
    setSwept(true);
    setTimeout(() => setSwept(false), 600);
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
        <div className="project-num">// {proj.num}</div>
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
              {proj.stack.map((t) => <span key={t} className="tag purple">{t}</span>)}
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
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    setSwept(true);
    setTimeout(() => setSwept(false), 550);
  };

  return (
    <div ref={ref} className={`expertise-card ${card.color}`} onClick={handleClick}>
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
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const [booted, setBooted] = useState(false);
  useFadeUp();

  return (
    <>
      <BootScreen onComplete={() => setBooted(true)} />

      <div style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <Navbar />
        <main>
          <Hero />

          {/* TERMINAL — collapsible, below hero */}
          <TerminalSection />

          <hr className="section-divider" />

          {/* EXPERIENCE */}
          <section id="experience" className="section">
            <div className="section-label fade-up">01</div>
            <h2 className="section-title fade-up">Work Experience</h2>
            <div className="timeline" style={{ paddingLeft: 4 }}>
              {EXPERIENCE.map((exp) => (
                <div key={exp.company} className="fade-up">
                  <ExperienceCard exp={exp} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* PROJECTS */}
          <section id="projects" className="section">
            <div className="section-label fade-up">02</div>
            <h2 className="section-title fade-up">Projects</h2>
            <div className="projects-grid">
              {PROJECTS.map((p) => (
                <div key={p.num} className="fade-up">
                  <ProjectCard proj={p} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* EXPERTISE */}
          <section id="expertise" className="section">
            <div className="section-label fade-up">03</div>
            <h2 className="section-title fade-up">Technical Expertise</h2>
            <div className="expertise-grid">
              {EXPERTISE.map((card) => (
                <div key={card.name} className="fade-up">
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
              {EDUCATION.map((e) => (
                <div key={e.school} className="fade-up">
                  <EducationCard edu={e} />
                </div>
              ))}
            </div>
          </section>

          <hr className="section-divider" />

          {/* CONTACT */}
          <section id="contact" className="contact-section">
            <h2 className="contact-title fade-up">
              Let's build<br /><span>something great.</span>
            </h2>
            <p className="contact-sub fade-up">
              Open to frontend & fullstack roles. Available May 2026, US authorized.
            </p>
            <div className="contact-links fade-up">
              <a href="mailto:gauri2029@gmail.com" className="contact-link">✉ gauri2029@gmail.com</a>
              <a href="https://linkedin.com/in/gaurimarkandey" target="_blank" rel="noopener noreferrer" className="contact-link">↗ LinkedIn</a>
              <a href="https://github.com/gauri2029" target="_blank" rel="noopener noreferrer" className="contact-link">⌥ GitHub</a>
            </div>
          </section>
        </main>

        <footer>
          <span>Gauri Markandey © 2026</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
            built with next.js
          </span>
        </footer>
      </div>
    </>
  );
}
