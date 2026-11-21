'use client';

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

/** Vertical rail that fills with the accent colour as you scroll; dots light up once the fill passes them. */
export function TimelineRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  useMotionValueEvent(fill, 'change', (v) => {
    const root = ref.current;
    if (!root) return;
    const rail = root.getBoundingClientRect();
    const fillY = rail.top + 12 + (rail.height - 24) * v;
    root.querySelectorAll<HTMLElement>('[data-timeline-dot]').forEach((dot) => {
      dot.dataset.on = String(dot.getBoundingClientRect().top <= fillY);
    });
  });

  return (
    <div ref={ref} className="relative pl-10 sm:pl-14">
      <div className="absolute bottom-3 left-5 top-3 w-px -translate-x-1/2 sm:left-7">
        <div className="absolute inset-0 bg-line" />
        <motion.div className="absolute inset-0 origin-top bg-primary/70" style={{ scaleY: reduce ? 1 : fill }} />
      </div>
      <div className="space-y-7 sm:space-y-9">{children}</div>
    </div>
  );
}
