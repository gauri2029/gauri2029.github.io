'use client';

import { useEffect, useRef, useState } from 'react';

// `error` events on <img>/<video> don't bubble, and these elements are
// server-rendered — if we set `src` directly in JSX, the browser can fetch
// and fail before React finishes hydrating and attaching the error
// listener, silently losing the event. So instead we render the element
// without a `src`, then in an effect attach the error listener via `ref`
// *first* and only then assign `src` imperatively — the fetch can't
// resolve before the listener is already in place.

// Self-hosted demo video: autoplay/muted/loop for motion-OK visitors, falls
// back to a paused, controllable player (with poster) under
// prefers-reduced-motion, and disappears entirely if the file is missing
// instead of showing a broken player.
export function DemoVideo({ src, poster, name }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  // Lazy-initialized so the very first client render already respects the
  // preference (avoids a one-frame flash of autoplay before an effect
  // could correct it).
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !src) return undefined;
    const onError = () => setFailed(true);
    el.addEventListener('error', onError);
    el.src = src;
    return () => el.removeEventListener('error', onError);
  }, [src]);

  if (failed) return null;

  return (
    <div className="case-study-media">
      <video
        ref={videoRef}
        className="case-study-video"
        poster={poster}
        autoPlay={!reducedMotion}
        loop={!reducedMotion}
        muted
        playsInline
        controls={reducedMotion}
        aria-label={`${name} demo video`}
      />
    </div>
  );
}

// Plain <img> with a missing-file fallback — renders nothing rather than a
// broken-image icon when the file isn't there yet.
export function ImgWithFallback({ src, alt, className }) {
  const imgRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !src) return undefined;
    const onError = () => setFailed(true);
    el.addEventListener('error', onError);
    el.src = src;
    return () => el.removeEventListener('error', onError);
  }, [src]);

  if (!src || failed) return null;

  return <img ref={imgRef} alt={alt} className={className} />;
}
