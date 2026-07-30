import EducationCard from './EducationCard';
import { EDUCATION } from '../data/education';

export default function Education() {
  return (
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
  );
}
