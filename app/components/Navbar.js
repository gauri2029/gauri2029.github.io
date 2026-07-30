'use client';

import ModeSwitcher from './ModeSwitcher';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ mode, updateMode }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">GM</div>
      <ul className="nav-links">
        <li><a href="#work">Selected Work</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#open-source">Open Source</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div className="nav-right">
        <div className="nav-status">
          <div className="status-dot" />
          Open to work
        </div>
        <ModeSwitcher mode={mode} updateMode={updateMode} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
