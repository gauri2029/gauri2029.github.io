import { SOCIAL } from '../data/social';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid-bg" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-layout">

          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Frontend Software Engineer · Open to opportunities
            </div>

            <h1 className="hero-name">
              Gauri
              <span className="hero-name-accent">Markandey.</span>
            </h1>

            <p className="hero-tagline">
              Frontend engineer building interfaces people enjoy using—and the systems that keep them running.
            </p>

            <p className="hero-sub">
              <strong>2+ years in production</strong> with React, Angular, and TypeScript across healthcare, biomedical,
              and developer-tool products — with full-stack and cloud breadth in Spring Boot, AWS, and Docker.
            </p>

            <div className="hero-cta">
              <a href="#work" className="btn btn-primary">Explore Selected Work →</a>
              <a href={SOCIAL.resume} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View Résumé</a>
              <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">GitHub ↗</a>
              <a href="#contact" className="btn btn-ghost">Contact</a>
            </div>

            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="hero-meta-label">Experience</span>
                <span className="hero-meta-value">2+ years · Frontend-focused</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Education</span>
                <span className="hero-meta-value">M.S. CS · Indiana University, 2026</span>
              </div>
            </div>
          </div>

          <div className="hero-avatar-wrap">
            <div className="hero-avatar-ring" />
            <div className="hero-badge hero-badge-tl">React</div>
            <div className="hero-badge hero-badge-tr">Angular</div>
            <div className="hero-badge hero-badge-bl">TypeScript</div>
            <div className="hero-badge hero-badge-br">Spring Boot</div>
            <img src="/avatar.png" alt="Gauri Markandey" className="hero-avatar-img" />
          </div>

        </div>
      </div>
    </section>
  );
}
