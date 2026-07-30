'use client';

import { useEffect, useRef, useState } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram';

function tabsFor(project) {
  const tabs = ['Product'];
  if (project.architecture) tabs.push('Architecture');
  tabs.push('Frontend', 'Results');
  return tabs;
}

export default function ProjectWorkbench({ project, onClose, reducedMotion }) {
  const tabs = tabsFor(project);
  const [tab, setTab] = useState(tabs[0]);
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      const idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') setTab(tabs[(idx + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') setTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [tab, tabs, onClose]);

  return (
    <div className="workbench-overlay" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className={`workbench-panel accent-${project.accent}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} case study`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="workbench-head">
          <div>
            <div className="workbench-title">{project.name}</div>
            <div className="workbench-tagline">{project.tagline}</div>
          </div>
          <button className="workbench-close" onClick={onClose} aria-label="Close case study">✕</button>
        </div>

        <div className="workbench-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`workbench-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="workbench-body" role="tabpanel">
          {tab === 'Product' && (
            <>
              {project.image && (
                <div className="workbench-media">
                  <img src={project.image} alt={`${project.name} product screenshot`} loading="lazy" />
                </div>
              )}
              {project.gallery && (
                <div className="workbench-gallery">
                  {project.gallery.map((src) => (
                    <img key={src} src={src} alt={`${project.name} additional screenshot`} loading="lazy" />
                  ))}
                </div>
              )}
              {project.team && <p style={{ fontStyle: 'italic' }}>{project.team}</p>}
              <div className="workbench-section-title">The problem</div>
              <p>{project.problem}</p>
              <div className="workbench-section-title">What I built</div>
              <ul className="workbench-list">
                {project.whatIBuilt.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          )}

          {tab === 'Architecture' && project.architecture && (
            <>
              <ArchitectureDiagram architecture={project.architecture} reducedMotion={reducedMotion} />
              <div className="workbench-section-title">Key engineering decision</div>
              <p>{project.decision}</p>
            </>
          )}

          {tab === 'Frontend' && (
            <>
              <div className="workbench-section-title">Frontend engineering</div>
              <ul className="workbench-list">
                {(project.frontendNotes || project.whatIBuilt).map((item) => <li key={item}>{item}</li>)}
              </ul>
              {!project.architecture && (
                <>
                  <div className="workbench-section-title">Key engineering decision</div>
                  <p>{project.decision}</p>
                </>
              )}
            </>
          )}

          {tab === 'Results' && (
            <>
              <div className="workbench-section-title">Verified result</div>
              <div className="workbench-result">{project.result}</div>
              <div className="workbench-section-title" style={{ marginTop: 20 }}>Stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.stack.map((t) => <span key={t} className="tag accent">{t}</span>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
