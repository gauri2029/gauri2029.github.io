'use client';

import { useState, useCallback } from 'react';

import BootScreen from './components/BootScreen';
import MotionLayer from './components/MotionLayer';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Experience from './components/Experience';
import OpenSource from './components/OpenSource';
import Education from './components/Education';
import Contact from './components/Contact';
import CommandPalette from './components/CommandPalette';

import { useWorldMode } from './hooks/useWorldMode';
import { useFadeUp } from './hooks/useFadeUp';
import { useReducedMotion } from './hooks/useReducedMotion';

const TOOLS = ['React', 'Angular', 'TypeScript', 'Next.js', 'Spring Boot', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'];

export default function Page() {
  const [booted, setBooted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [activeTech, setActiveTech] = useState(null);
  const [openProject, setOpenProject] = useState(null);
  const { mode, updateMode } = useWorldMode();
  const reducedMotion = useReducedMotion();

  const handleModeChange = useCallback((m) => {
    updateMode(m);
    if (m !== 'chaos') setActiveTech(null);
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  }, [updateMode]);

  const handleTechClick = useCallback((tech) => {
    setActiveTech((prev) => (prev === tech ? null : tech));
  }, []);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  useFadeUp();

  return (
    <>
      <BootScreen onComplete={handleBootComplete} />

      <div
        style={{ opacity: booted ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 0.9s ease' }}
        className={activeTech ? 'tech-active' : ''}
      >
        <div className={`mode-flash${flash ? ' active' : ''}`} aria-hidden="true" />

        <MotionLayer />
        <Navbar mode={mode} updateMode={handleModeChange} />
        <main>
          <Hero />

          <hr className="section-divider" />

          <Projects
            activeTech={activeTech}
            onTechClick={handleTechClick}
            reducedMotion={reducedMotion}
            openProject={openProject}
            setOpenProject={setOpenProject}
          />

          <hr className="section-divider" />

          <Experience activeTech={activeTech} onTechClick={handleTechClick} />

          <hr className="section-divider" />

          <OpenSource />

          <hr className="section-divider" />

          <Education />

          <hr className="section-divider" />

          <Contact />
        </main>

        <div className="tools-strip">
          {TOOLS.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>

        <footer>
          <span style={{ fontWeight: 600 }}>Gauri Markandey</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)' }}>
            © 2026 · Built with Next.js & Tailwind CSS
          </span>
        </footer>
      </div>

      <CommandPalette mode={mode} onOpenProject={setOpenProject} />
    </>
  );
}
