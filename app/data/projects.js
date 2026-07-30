// Each project's `architecture` describes a simplified real system flow,
// rendered by ArchitectureDiagram.js — not a decorative diagram.

export const PROJECTS = [
  {
    id: 'docuquery',
    kind: 'owned',
    accent: 'teal',
    num: '01',
    name: 'DocuQuery',
    tagline: 'Full-stack RAG document intelligence workspace',
    image: '/projects/docuquery.jpg',
    problem:
      'Ask a technical document a question in plain English and most tools either blend every indexed document into one confused answer, or ship your private docs to a third-party black box with no way to verify the response.',
    whatIBuilt: [
      'Multi-document ingestion (upload or paste Markdown/text/JSON) into a persistent library',
      'Conversational query workspace with structured, source-cited answers',
      'Clarification prompts when a question could match more than one document',
      'Optional document-scoped retrieval via an explicit documentId filter',
      'Evidence panel that traces every answer back to its retrieved chunks',
      'Health checks and P50/P95/P99 latency observability',
    ],
    decision:
      'When a question is ambiguous across indexed documents, DocuQuery asks which one you mean, then filters ChromaDB retrieval by documentId — kept optional so unscoped queries stay backward-compatible. This stops overlapping documents from being blended into one unreliable answer.',
    result:
      'P95 query latency under 1 second, running across 5 containerized services (Spring Boot API, ChromaDB, PostgreSQL, Prometheus, Grafana) with Micrometer-backed observability.',
    frontendNotes: [
      'React + TypeScript workspace with a collapsible question composer and structured Markdown answer rendering',
      'Document library sidebar for selecting, switching, and deleting indexed documents',
      'Evidence panel UI for tracing an answer back to its retrieved source chunks',
    ],
    stack: ['React', 'TypeScript', 'Spring Boot', 'ChromaDB', 'PostgreSQL', 'OpenAI', 'Docker', 'Prometheus', 'Grafana'],
    links: {
      github: 'https://github.com/gauri2029/docuquery',
      demo: 'https://drive.google.com/file/d/1OeTDW4mcnfuETuSQ3dMDMHyTvZwymkSu/view?usp=sharing',
    },
    architecture: {
      nodes: [
        { id: 'user', label: 'User', group: 'client' },
        { id: 'ui', label: 'React + TS Workspace', group: 'client' },
        { id: 'api', label: 'Spring Boot API', group: 'api' },
        { id: 'embed', label: 'OpenAI Embeddings', group: 'ai' },
        { id: 'chroma', label: 'ChromaDB', group: 'data' },
        { id: 'pg', label: 'PostgreSQL', group: 'data' },
        { id: 'llm', label: 'GPT-4o-mini', group: 'ai' },
        { id: 'metrics', label: 'Prometheus / Grafana', group: 'obs' },
      ],
      edges: [
        ['user', 'ui'], ['ui', 'api'],
        ['api', 'embed'], ['embed', 'chroma'], ['api', 'pg'],
        ['api', 'llm'], ['chroma', 'llm'], ['llm', 'ui'],
        ['api', 'metrics'],
      ],
    },
  },
  {
    id: 'hra',
    kind: 'oss',
    accent: 'indigo',
    num: '02',
    name: 'Human Reference Atlas',
    tagline: 'Open-source contributions to an NIH-funded biomedical atlas',
    problem:
      'The Human Reference Atlas is a publicly funded, actively used research platform — code shipped here goes straight to biomedical researchers, so accessibility and stability are non-negotiable, not nice-to-haves.',
    whatIBuilt: [
      'Angular and TypeScript features for biomedical data exploration tools',
      'Reusable, Storybook-documented component libraries shared across the platform',
      'WCAG-accessible interaction patterns for research-facing UI',
      'RxJS-driven data workflows across contributed features',
    ],
    decision:
      'Contributed through the same open-source review process as the rest of the HRA team — every change went through public PR review before merging into a platform used by outside researchers.',
    result: 'Multiple merged pull requests across the HRA ecosystem — features, fixes, and code review, all verifiable in the open.',
    stack: ['Angular', 'TypeScript', 'RxJS', 'WCAG', 'Storybook', 'AWS S3'],
    links: {
      github: 'https://github.com/hubmapconsortium/hra-ui',
      demo: 'https://github.com/pulls?q=is%3Apr+is%3Amerged+author%3Agauri2029+org%3Ahubmapconsortium',
      demoLabel: 'Merged pull requests',
    },
  },
  {
    id: 'iucat',
    kind: 'owned',
    accent: 'amber',
    num: '03',
    name: 'IUCAT Library System',
    tagline: 'Full-stack library management — search, rentals, holds',
    image: '/projects/iucat.jpg',
    problem:
      'Most student library-system projects stop at a CRUD API demo. This needed real borrowing workflows, a working holds queue, and a deployment anyone could actually click through.',
    whatIBuilt: [
      'AJAX-powered catalog search over 100+ books',
      '14-day rentals with extensions, returns, and an auto-managed holds queue',
      'Role-based, session-authenticated user workflows',
      'Liveness, readiness, and health endpoints',
      'Structured JSON logging with MDC correlation IDs and Prometheus metrics',
      'One GitHub Actions pipeline building, testing, and deploying to two targets',
    ],
    decision:
      'Deployed the same image two ways: continuously to Render as the public demo, and to AWS ECS Fargate behind an Application Load Balancer to prove out a cloud-native path. The ECS architecture is fully built and validated but currently paused to avoid ongoing infrastructure cost — Render stays live as the demo.',
    result: 'k6 baseline test: 100% success rate, 75ms average and 109ms P95 response time across 660 requests (controlled baseline, not a production-scale benchmark).',
    frontendNotes: [
      'Server-rendered Thymeleaf views with AJAX-driven catalog search and filtering',
      'Rental, extension, return, and hold-queue flows surfaced directly in the UI',
      'No client-side framework — vanilla JavaScript kept the interactions fast and dependency-free',
    ],
    stack: ['Spring Boot', 'Thymeleaf', 'JavaScript', 'AJAX', 'Docker', 'GitHub Actions', 'JUnit', 'k6', 'Prometheus'],
    links: {
      github: 'https://github.com/gauri2029/iucat',
      demo: 'https://iucat-library.onrender.com',
    },
    architecture: {
      nodes: [
        { id: 'gh', label: 'GitHub Actions', group: 'api' },
        { id: 'docker', label: 'Docker Hub / ECR', group: 'api' },
        { id: 'render', label: 'Render (live)', group: 'client' },
        { id: 'ecs', label: 'ECS Fargate (paused)', group: 'client' },
        { id: 'app', label: 'Spring Boot App', group: 'api' },
        { id: 'obs', label: 'Health + Prometheus', group: 'obs' },
      ],
      edges: [
        ['gh', 'docker'], ['docker', 'render'], ['docker', 'ecs'],
        ['render', 'app'], ['ecs', 'app'], ['app', 'obs'],
      ],
    },
  },
  {
    id: 'degreeflow',
    kind: 'owned',
    accent: 'moss',
    num: '04',
    name: 'Degree Flowchart',
    tagline: 'Cloud-native degree planning — Angular UI + Spring Boot microservices',
    team: 'Team project (5–6 engineers) — built the Angular frontend, the degree-edge-service API gateway, and two backend services (course-service, degree-service).',
    problem:
      'Students had no structured way to plan a multi-year degree path beyond spreadsheets, manual tracking, and advisor emails.',
    whatIBuilt: [
      'Angular + TypeScript semester planning UI with prerequisite validation',
      'OAuth 2.0 authentication via Keycloak',
      'An API gateway routing to independently deployed Spring Boot microservices',
      'Two backend services (course catalog, degree requirements) with their own PostgreSQL databases',
      'Kubernetes manifests for containerized deployment',
    ],
    decision:
      'Split the backend into 7 Spring Boot microservices, each owning its own PostgreSQL database, behind a single API gateway — so course, student, and degree data could evolve and scale independently instead of one monolith owning all of it.',
    result: 'k6 load-tested to 1,000 concurrent users — 245ms median latency and 95%+ success rate.',
    frontendNotes: [
      'Angular + TypeScript semester planning UI with live prerequisite validation',
      'Keycloak-backed login flow and role-based routing guards',
      'Credit calculator and semester-by-semester course organization views',
    ],
    stack: ['Angular', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Keycloak', 'Docker', 'Kubernetes', 'k6'],
    links: {
      github: 'https://github.com/degree-flowchart/degree-flowchart-ui',
      demo: 'https://github.com/degree-flowchart',
      demoLabel: 'Organization (9 repos)',
    },
    architecture: {
      nodes: [
        { id: 'ui', label: 'Angular UI', group: 'client' },
        { id: 'keycloak', label: 'Keycloak (OAuth2)', group: 'api' },
        { id: 'gateway', label: 'API Gateway', group: 'api' },
        { id: 'course', label: 'Course Service', group: 'api' },
        { id: 'student', label: 'Student Service', group: 'api' },
        { id: 'degree', label: 'Degree Service', group: 'api' },
        { id: 'pg', label: 'PostgreSQL (per service)', group: 'data' },
        { id: 'k8s', label: 'Kubernetes', group: 'obs' },
      ],
      edges: [
        ['ui', 'keycloak'], ['ui', 'gateway'],
        ['gateway', 'course'], ['gateway', 'student'], ['gateway', 'degree'],
        ['course', 'pg'], ['student', 'pg'], ['degree', 'pg'],
        ['gateway', 'k8s'],
      ],
    },
  },
  {
    id: 'f1-dashboard',
    kind: 'owned',
    accent: 'crimson',
    num: '05',
    name: 'F1 Data Analysis Dashboard',
    tagline: 'Interactive Formula 1 race, tire, and standings analytics',
    team: 'Team coursework project (3 engineers: Gauri Markandey, Krisha Elle, Suraj Iyer).',
    image: '/projects/f1.jpg',
    gallery: ['/projects/f1-drivers.jpg', '/projects/f1-teams.jpg'],
    problem:
      'Race data across a season is scattered across timing sheets and telemetry feeds — hard to compare drivers, tire strategy, or team form without pulling it together yourself.',
    whatIBuilt: [
      'Driver lap-time and pace comparisons across a Grand Prix',
      'Tire age and compound degradation analysis',
      'Qualifying consistency and weather-impact views',
      'Team podium and championship standings across the 2023–2024 seasons',
      'Saved custom analyses for later review',
    ],
    decision:
      'Cached FastF1 session data into SQLite on first load so repeated queries hit a local database instead of re-fetching from the FastF1 API — kept the stack lightweight (Flask + SQLite) since this didn’t need a hosted database.',
    result: 'Covers full race, qualifying, weather, and standings data for the 2023 and 2024 F1 seasons with interactive Plotly visualizations.',
    frontendNotes: [
      'Bootstrap-based responsive dashboard with season, race, driver, and team selectors',
      'Dynamic Plotly charts for lap-time comparisons, tire strategy, and standings',
      'Saved-analysis views for revisiting a comparison later',
    ],
    stack: ['Flask', 'FastF1', 'Plotly', 'JavaScript', 'Bootstrap', 'SQLite'],
    links: {
      github: 'https://github.com/gauri2029/F1-Data-Analysis-Dashboard',
      demo: 'https://drive.google.com/file/d/1mzVdEZZwFLwwuQJYEcir7mBiYbF8HXCy/view?usp=sharing',
    },
  },
];
