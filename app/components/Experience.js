import ExperienceCard from './ExperienceCard';
import { EXPERIENCE } from '../data/experience';

export default function Experience({ activeTech, onTechClick }) {
  return (
    <section id="experience" className="section" style={{ position: 'relative' }}>
      <div className="section-glow section-glow-a" />
      <div className="section-label fade-up">02</div>
      <h2 className="section-title fade-up">Professional Experience</h2>
      <p className="section-sub fade-up">Two years building production frontend systems — with full-stack delivery in between.</p>
      <div className="timeline" style={{ paddingLeft: 4 }}>
        {EXPERIENCE.map((exp, i) => (
          <div key={exp.company} className="fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
            <ExperienceCard exp={exp} activeTech={activeTech} onTechClick={onTechClick} />
          </div>
        ))}
      </div>
    </section>
  );
}
