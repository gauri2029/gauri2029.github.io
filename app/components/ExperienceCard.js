'use client';

import { useState } from 'react';

export default function ExperienceCard({ exp, activeTech, onTechClick }) {
  const [open, setOpen] = useState(false);
  const [swept, setSwept] = useState(false);

  const handleClick = () => {
    setOpen((o) => !o);
    setSwept(true);
    setTimeout(() => setSwept(false), 550);
  };

  const matches = activeTech ? exp.stack.includes(activeTech) : false;

  return (
    <div className={`exp-card${open ? ' open' : ''}${matches ? ' tech-match-card' : ''}`}>
      {swept && <div className="sweep" />}
      <div className="exp-header" onClick={handleClick}>
        <div>
          <div className="exp-role">{exp.role}</div>
          <div className="exp-company">{exp.company}</div>
          <div className="exp-meta">
            <span>{exp.period}</span>
            <span>{exp.location}</span>
          </div>
        </div>
        <div className="exp-toggle">+</div>
      </div>
      <div className="exp-body-wrap">
        <div className="exp-body-inner">
          <div className="exp-body">
            <div className="exp-stack">
              {exp.stack.map((t) => (
                <span
                  key={t}
                  className={`tag accent tech-tag${activeTech === t ? ' tech-match' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onTechClick?.(t); }}
                >
                  {t}
                </span>
              ))}
            </div>
            <ul className="exp-bullets">
              {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
