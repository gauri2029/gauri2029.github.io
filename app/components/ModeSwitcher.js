'use client';

export default function ModeSwitcher({ mode, updateMode }) {
  const modes = [
    { id: 'professional', label: '◼ Pro', title: 'Professional mode' },
    { id: 'chaos', label: '⚡ Explore', title: 'Explore mode — command palette & tech map' },
  ];
  return (
    <div className="mode-switcher" aria-label="Site mode">
      {modes.map((m) => (
        <button
          key={m.id}
          className={`mode-btn${mode === m.id ? ' active' : ''}`}
          onClick={() => updateMode(m.id)}
          title={m.title}
          aria-pressed={mode === m.id}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
