'use client';

import { useState, useEffect } from 'react';

const BOOT_LINES = [
  { text: 'GAURI_MARKANDEY_SYS  v5.0.0', cls: 'bright' },
  { text: '─────────────────────────────', cls: '' },
  { text: 'Booting...', cls: '' },
  { text: '[OK] React · Angular · TypeScript', cls: 'green' },
  { text: '[OK] Spring Boot · Node.js · AWS', cls: 'green' },
  { text: '[OK] Docker · Kubernetes · CI/CD', cls: 'green' },
  { text: '', cls: '' },
  { text: '[MOD] design-systems.ko', cls: 'accent' },
  { text: '[MOD] wcag-a11y.ko', cls: 'accent' },
  { text: '[MOD] rag-pipeline.ko', cls: 'accent' },
  { text: '', cls: '' },
  { text: '$ exec portfolio --mode=professional', cls: 'bright' },
];

export default function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDone(true);
      onComplete();
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => setFading(true), 350);
        setTimeout(() => { setDone(true); onComplete(); }, 900);
        return;
      }
      setLines((prev) => [...prev, BOOT_LINES[i]]);
      i++;
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  if (done) return null;

  return (
    <div className={`boot-screen${fading ? ' fade-out' : ''}`}>
      <div className="boot-inner">
        {lines.map((l, idx) => (
          <div key={idx} className={`boot-line ${l?.cls ?? ''}`}>{l?.text ?? ''}</div>
        ))}
        {!fading && <div className="boot-line"><span className="boot-cursor" /></div>}
      </div>
    </div>
  );
}
