import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROJECTS } from '../../data/projects';
import { DemoVideo, ImgWithFallback } from './CaseStudyMedia';

function findProject(slug) {
  return PROJECTS.find((p) => p.caseStudySlug === slug);
}

export function generateStaticParams() {
  return PROJECTS.filter((p) => p.caseStudySlug).map((p) => ({ slug: p.caseStudySlug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};

  const title = `${project.name} — Gauri Markandey`;
  const description = project.pitch || project.tagline;
  const poster = project.previewImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: poster ? [{ url: poster }] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: poster ? [poster] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return (
    <main className="case-study">
      <div className="case-study-inner">
        <Link href="/#projects" className="case-study-back">
          <span aria-hidden="true">←</span> Back to projects
        </Link>

        <header className={`case-study-head accent-${project.accent}`}>
          <h1 className="case-study-title">{project.name}</h1>
          {project.pitch && <p className="case-study-pitch">{project.pitch}</p>}
          <div className="case-study-stack">
            {project.stack.map((t) => (
              <span key={t} className="tag accent">{t}</span>
            ))}
          </div>
        </header>

        <DemoVideo
          src={`/projects/${slug}/demo.mp4`}
          previewImage={project.previewImage}
          name={project.name}
        />

        {project.stats?.length > 0 && (
          <div className="case-study-stats">
            {project.stats.map((s) => (
              <div key={s.label} className="metric-box case-study-stat">
                <div className="metric-val">{s.val}</div>
                <div className="metric-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <section className="case-study-section">
          <h2 className="case-study-section-title">Problem</h2>
          <p>{project.problem}</p>
        </section>

        {project.whatIBuilt?.length > 0 && (
          <section className="case-study-section">
            <h2 className="case-study-section-title">What I Built</h2>
            <ul className="case-study-list">
              {project.whatIBuilt.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {project.architectureImage && (
          <section className="case-study-section">
            <h2 className="case-study-section-title">Architecture</h2>
            <div className="case-study-architecture-scroll">
              <ImgWithFallback
                src={project.architectureImage}
                alt={`${project.name} architecture diagram`}
                className="case-study-architecture"
              />
            </div>
          </section>
        )}

        {project.whatNext && (
          <section className="case-study-section">
            <h2 className="case-study-section-title">What I&rsquo;d Build Next</h2>
            {project.whatNext === 'TODO' ? (
              <p className="case-study-todo">TODO — not written yet.</p>
            ) : (
              <p>{project.whatNext}</p>
            )}
          </section>
        )}

        {(project.links?.github || project.links?.demo) && (
          <div className="case-study-actions">
            {project.links?.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                GitHub ↗
              </a>
            )}
            {project.links?.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Live Demo ↗
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
