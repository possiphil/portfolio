'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/** Slow zoom + drift of the hero image while the page scrolls away. */
export function HeroParallax({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, 140]);
  const scale = useTransform(scrollY, [0, 900], [1.02, 1.1]);
  return (
    <motion.div className={className} style={{ ...style, ...(reduce ? {} : { y, scale }) }}>
      {children}
    </motion.div>
  );
}

/** Little mouse with a bouncing accent dot; fades out once you start scrolling. */
export function ScrollIndicator() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 160], [1, 0]);
  return (
    <motion.div aria-hidden="true" className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 md:block" style={{ opacity }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}>
        <motion.div
          className="flex h-8 w-5 items-start justify-center rounded-full border border-foreground/20 p-1.5"
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="h-1.5 w-1 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
