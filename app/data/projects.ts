// Single source of truth for both the homepage project cards and the
// `/projects/<slug>` case-study pages. Only projects with `caseStudySlug`
// set get a case-study page (and an internal link from their homepage
// card) — everything else keeps today's external-link-only card.

export interface ProjectStat {
  val: string;
  label: string;
}

export interface CaseStudyLinks {
  github?: string;
  demo?: string;
}

export interface Project {
  num: string;
  name: string;
  /** Legacy single external link, used for cards without a case-study page. */
  link?: string;
  image: string;
  accent: 'cobalt' | 'coral' | 'amber' | 'violet';
  tagline: string;
  desc: string;
  metrics: ProjectStat[];
  stack: string[];
  problem: string;
  approach: string;
  impact: string;
  period?: string;

  // ── Case-study page fields (only used when `caseStudySlug` is set) ──
  caseStudySlug?: string;
  /** One-line pitch shown under the case-study title. */
  pitch?: string;
  /**
   * Static image (screenshot or gif) shown in the case-study page's media
   * slot. Used as-is when there's no `demo.mp4` yet, and as the <video>
   * poster once one exists. Separate from `image` (the homepage card
   * thumbnail) since the two don't always match — e.g. DocuQuery's
   * homepage card keeps its existing illustration while the case-study
   * page gets a real product screenshot.
   */
  previewImage?: string;
  /** 3-4 stat cards for the case-study page. */
  stats?: ProjectStat[];
  whatIBuilt?: string[];
  /**
   * "What I'd build next." No roadmap facts were supplied for either
   * case-study project yet, so this is left as an explicit TODO string
   * rather than invented — update this once there's real content.
   */
  whatNext?: string;
  architectureImage?: string;
  links?: CaseStudyLinks;
}

export const PROJECTS: Project[] = [
  {
    num: '01',
    name: 'Design Drift',
    image: '/projects/design-drift/poster.jpg',
    accent: 'violet',
    tagline: 'AI design QA that catches drift between Figma and production',
    desc: 'AI-powered design QA that compares Figma designs against live UIs, traces visual drift back to the exact source code responsible, and proposes fixes that stay behind human approval.',
    metrics: [
      { val: '92%', label: 'retrieval accuracy (CI-gated)' },
      { val: '8', label: 'specialized agents' },
    ],
    stack: ['React', 'TypeScript', 'FastAPI', 'LangGraph', 'PostgreSQL', 'Playwright', 'axe-core', 'Claude/Gemini'],
    // TODO: written from the given facts, not quoted from a README — adjust phrasing if you want a different framing.
    problem: 'Design and code drift apart silently. A Figma file stays the source of truth on paper, but nothing catches it when the live UI stops matching — or tells you which component is responsible.',
    approach: 'A LangGraph supervisor coordinates 8 specialized agents with typed Pydantic outputs: Playwright captures the live UI and diffs it pixel-by-pixel against Figma, axe-core audits accessibility across 4 breakpoints, and any proposed fix is reversible and held behind human approval before it touches source.',
    impact: '92% retrieval accuracy gated in CI, backed by 300+ backend tests and an eval harness that caught 3 real defects unit tests had missed.',
    caseStudySlug: 'design-drift',
    pitch: 'AI design QA that compares Figma to live UIs, traces drift to source code, and proposes fixes behind human approval.',
    // Real screenshot of Design Drift's own drift-detection UI. Will be
    // swapped for an actual demo gif/video later.
    previewImage: '/projects/design-drift/poster.jpg',
    stats: [
      { val: '8', label: 'specialized agents' },
      { val: '92%', label: 'retrieval accuracy, gated in CI' },
      { val: '300+', label: 'backend tests' },
      { val: '4', label: 'breakpoints audited' },
    ],
    whatIBuilt: [
      'Playwright-based UI capture with pixel diffing and automated axe-core accessibility audits across 4 breakpoints',
      'A LangGraph supervisor orchestrating 8 specialized agents with typed Pydantic outputs for structured, reliable agent-to-agent communication',
      'Reversible, human-approved patch proposals — the system never applies a fix without sign-off',
      'Real-time progress streaming to the UI via Server-Sent Events (SSE)',
      'An eval harness, backed by 300+ backend tests, that caught 3 real defects unit tests had missed',
    ],
    whatNext: 'TODO',
    architectureImage: '/projects/design-drift/architecture.svg',
    links: {
      github: 'https://github.com/gauri2029/design-drift',
    },
  },
  {
    num: '02',
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
    caseStudySlug: 'docuquery',
    pitch: 'A RAG workspace with document-scoped retrieval, cited answers, and observability.',
    // Real screenshot of DocuQuery's document-ingestion screen.
    previewImage: '/projects/docuquery/poster.jpg',
    stats: [
      { val: 'Sub-second', label: 'P95 latency' },
      { val: '5', label: 'services orchestrated' },
      { val: 'P50/P95/P99', label: 'latency dashboards' },
    ],
    whatIBuilt: [
      'Chunking and embedding pipeline indexing documents into ChromaDB',
      'Document-scoped retrieval so answers stay scoped to the right source',
      'Cited answers, with graceful handling when context is insufficient rather than a fabricated response',
      'Micrometer metrics surfaced as P50/P95/P99 dashboards in Grafana',
    ],
    whatNext: 'TODO',
    architectureImage: '/projects/docuquery/architecture.svg',
    links: {
      github: 'https://github.com/gauri2029/docuquery',
    },
  },
  {
    num: '03',
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
    num: '04',
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
