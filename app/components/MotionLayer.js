'use client';

import { useEffect, useRef } from 'react';

export default function MotionLayer() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const navbar = document.querySelector('.navbar');
    const onScroll = () => {
      if (!navbar) return;
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const glows = document.querySelectorAll('.section-glow');
    const glowObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
        else e.target.classList.remove('visible');
      }),
      { threshold: 0.1 }
    );
    glows.forEach((g) => glowObserver.observe(g));

    let onMove;
    if (!reduced) {
      onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
      const tick = () => {
        if (cursorRef.current) {
          cursorRef.current.style.left = pos.current.x + 'px';
          cursorRef.current.style.top = pos.current.y + 'px';
        }
        raf.current = requestAnimationFrame(tick);
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      raf.current = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (onMove) window.removeEventListener('mousemove', onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      glowObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="dot-grid" aria-hidden="true" />
      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />
    </>
  );
}
