'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { PROJECTS } from '../data/projects';
import { SOCIAL } from '../data/social';

function buildCommands({ onOpenProject }) {
  const projectCommands = PROJECTS.map((p) => ({
    id: `open-${p.id}`,
    label: `open ${p.id.replace('-', '')}`,
    hint: `Open ${p.name} case study`,
    run: () => {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      onOpenProject(p);
    },
  }));

  return [
    ...projectCommands,
    {
      id: 'show-frontend',
      label: 'show frontend work',
      hint: 'Jump to Selected Work',
      run: () => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'view-resume',
      label: 'view resume',
      hint: 'Open résumé in a new tab',
      run: () => window.open(SOCIAL.resume, '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'contact',
      label: 'contact gauri',
      hint: 'Jump to Contact',
      run: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'experience',
      label: 'show experience',
      hint: 'Jump to Professional Experience',
      run: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'github',
      label: 'open github',
      hint: 'Open GitHub profile in a new tab',
      run: () => window.open(SOCIAL.github, '_blank', 'noopener,noreferrer'),
    },
  ];
}

export default function CommandPalette({ mode, onOpenProject }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(() => buildCommands({ onOpenProject }), [onOpenProject]);
  const filtered = useMemo(
    () => commands.filter((c) => c.label.includes(query.trim().toLowerCase())),
    [commands, query]
  );

  useEffect(() => {
    if (mode !== 'chaos') { setOpen(false); return; }
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mode]);

  useEffect(() => { if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 20); } }, [open]);
  useEffect(() => { setActive(0); }, [query]);

  if (mode !== 'chaos') return null;

  const runActive = () => {
    const cmd = filtered[active];
    if (cmd) { cmd.run(); setOpen(false); }
  };

  return (
    <>
      <button className="command-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="hint-text">Command palette</span>
        <kbd>⌘K</kbd>
      </button>

      {open && (
        <div className="command-overlay" onClick={() => setOpen(false)} role="presentation">
          <div className="command-box" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="command-input"
              placeholder="Type a command… e.g. open docuquery, view resume, contact gauri"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                if (e.key === 'Enter') { e.preventDefault(); runActive(); }
              }}
              aria-label="Command input"
            />
            <ul className="command-list" role="listbox">
              {filtered.length === 0 && <li className="command-empty">No matching command</li>}
              {filtered.map((c, i) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={i === active}
                  className={`command-item${i === active ? ' active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => { c.run(); setOpen(false); }}
                >
                  <span>{c.label}</span>
                  <span className="command-hint">{c.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
