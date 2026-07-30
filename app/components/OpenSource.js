import { SOCIAL } from '../data/social';

const LINKS = [
  {
    label: 'Open-source contribution',
    text: 'Merged PRs — Human Reference Atlas',
    href: 'https://github.com/pulls?q=is%3Apr+is%3Amerged+author%3Agauri2029+org%3Ahubmapconsortium',
  },
  {
    label: 'CI/CD — live pipeline',
    text: 'DocuQuery build & test workflow',
    href: 'https://github.com/gauri2029/docuquery/actions',
  },
  {
    label: 'CI/CD — live pipeline',
    text: 'IUCAT build, test & deploy workflow',
    href: 'https://github.com/gauri2029/iucat/actions',
  },
  {
    label: 'Live deployment',
    text: 'IUCAT — Render',
    href: 'https://iucat-library.onrender.com',
  },
];

export default function OpenSource() {
  return (
    <section id="open-source" className="section" style={{ position: 'relative' }}>
      <div className="section-label fade-up">03</div>
      <h2 className="section-title fade-up">Built in the Open</h2>
      <p className="section-sub fade-up">
        Verifiable, not just described — live CI pipelines, a public deployment, and merged pull requests on an
        NIH-funded open-source platform.
      </p>

      <div className="credibility-grid fade-up">
        {LINKS.map((l) => (
          <div key={l.text} className="credibility-card">
            <div className="credibility-label">{l.label}</div>
            <a className="credibility-link" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.text} ↗
            </a>
          </div>
        ))}
      </div>

      <div className="credibility-stats fade-up">
        <img
          src={`https://github-readme-stats-rho-murex-69.vercel.app/api?username=gauri2029&show_icons=true&hide_border=true&theme=transparent`}
          alt="Gauri's GitHub statistics"
          loading="lazy"
        />
        <img
          src={`https://streak-stats.demolab.com?user=gauri2029&theme=transparent&hide_border=true&hide_total_contributions=false`}
          alt="Gauri's GitHub contribution streak"
          loading="lazy"
        />
        <a className="btn btn-ghost" href={SOCIAL.github} target="_blank" rel="noopener noreferrer">
          View full GitHub profile ↗
        </a>
      </div>
    </section>
  );
}
