import { SOCIAL } from '../data/social';

export default function Contact() {
  return (
    <section id="contact">
      <div className="contact-section">
        <h2 className="contact-title fade-up">
          Let's ship<br /><span>something real.</span>
        </h2>
        <p className="contact-sub fade-up">
          Frontend software engineer with full-stack and cloud breadth, looking for the next team building
          products worth using.
        </p>
        <div className="contact-links fade-up">
          <a href={`mailto:${SOCIAL.email}`} className="contact-link">✉ {SOCIAL.email}</a>
          <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">↗ LinkedIn</a>
          <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" className="contact-link">⌥ GitHub</a>
        </div>
      </div>
    </section>
  );
}
