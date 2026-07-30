'use client';

import { useState, useEffect, useCallback } from 'react';

export function useWorldMode() {
  const [mode, setMode] = useState('professional');

  useEffect(() => {
    const saved = localStorage.getItem('site-mode');
    if (saved) setMode(saved);
  }, []);

  const updateMode = useCallback((m) => {
    setMode(m);
    localStorage.setItem('site-mode', m);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return { mode, updateMode };
}
