'use client';

import { useRef, useState } from 'react';

export default function ProjectCard({ project, activeTech, onTechClick, onOpen, reducedMotion }) {
  const cardRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const matches = activeTech ? project.stack.includes(activeTech) : false;
  const hasImage = project.image && !imgError;

  const handleMouseMove = (e) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.setProperty('--tilt-y', `${px * 3}deg`);
    cardRef.current.style.setProperty('--tilt-x', `${-py * 3}deg`);
  };
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--tilt-x', '0deg');
    cardRef.current.style.setProperty('--tilt-y', '0deg');
  };

  const openWorkbench = () => onOpen(project);

  return (
    <div
      ref={cardRef}
      className={`project-card accent-${project.accent}${hasImage ? '' : ' no-image'}${matches ? ' tech-match-card' : ''}${reducedMotion ? '' : ' tiltable'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-content">
        <div className="project-top-row">
          <span className="project-num">// {project.num}</span>
          <span className="project-kind-badge">{project.kind === 'oss' ? 'Open Source' : 'Case Study'}</span>
        </div>
        <div className="project-name">{project.name}</div>
        <div className="project-tagline">{project.tagline}</div>
        {project.team && <div className="project-team">{project.team}</div>}

        <div className="project-stack-mini">
          {project.stack.slice(0, 6).map((t) => (
            <span
              key={t}
              className={`tag tech-tag${activeTech === t ? ' tech-match' : ''}`}
              onClick={(e) => { e.stopPropagation(); onTechClick?.(t); }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="project-links">
          <button className="project-open-btn" onClick={openWorkbench}>
            Open case study →
          </button>
          {project.links?.github && (
            <a
              className="project-link-btn"
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub ↗
            </a>
          )}
          {project.links?.demo && (
            <a
              className="project-link-btn"
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {project.links.demoLabel || 'Demo'} ↗
            </a>
          )}
        </div>
      </div>

      {hasImage && (
        <div className="project-media" onClick={openWorkbench} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWorkbench(); } }}
          aria-label={`Open ${project.name} case study`}
        >
          <img src={project.image} alt={`${project.name} preview`} loading="lazy" onError={() => setImgError(true)} />
        </div>
      )}
    </div>
  );
}
