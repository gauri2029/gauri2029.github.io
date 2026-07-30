'use client';

import ProjectCard from './ProjectCard';
import ProjectWorkbench from './ProjectWorkbench';
import { PROJECTS } from '../data/projects';

export default function Projects({ activeTech, onTechClick, reducedMotion, openProject, setOpenProject }) {
  return (
    <section id="work" className="section" style={{ position: 'relative' }}>
      <div className="section-glow section-glow-b" />
      <div className="section-label fade-up">01</div>
      <h2 className="section-title fade-up">Selected Work</h2>
      <p className="section-sub fade-up">
        Five projects, five real systems — click any card for the full case study: product, architecture, frontend
        engineering, and verified results.
      </p>
      <div className="projects-stack">
        {PROJECTS.map((p, i) => (
          <div key={p.id} className="fade-up" style={{ transitionDelay: `${i * 0.07}s` }}>
            <ProjectCard
              project={p}
              activeTech={activeTech}
              onTechClick={onTechClick}
              onOpen={setOpenProject}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </div>

      {openProject && (
        <ProjectWorkbench
          project={openProject}
          onClose={() => setOpenProject(null)}
          reducedMotion={reducedMotion}
        />
      )}
    </section>
  );
}
