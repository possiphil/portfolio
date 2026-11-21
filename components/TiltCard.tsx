'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useRef } from 'react';

/**
 * Portrait in a glass frame that tilts in 3D — driven by scroll position
 * and, on devices with a mouse, by the pointer. Light glint, rim and
 * drop shadow all move with the tilt.
 */
export function TiltCard({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scrollTilt = useTransform(scrollYProgress, [0, 1], [12, -8]);

  const px = useMotionValue(0); // -0.5 … 0.5
  const py = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateX = useTransform([scrollTilt, sy], ([s, y]: number[]) => s - y * 14);
  const rotateY = useTransform(sx, (x) => 1.75 + x * 16);

  const photoX = useTransform(sx, (x) => x * -14);
  const photoY = useTransform(rotateX, (r) => r * 1.5);
  const shadowX = useTransform(rotateY, (r) => 6 + r * 2.4);
  const shadowY = useTransform(rotateX, (r) => 24 + r * 2);
  const glintX = useTransform(rotateY, (r) => `${-2 - r * 0.9}%`);
  const glintY = useTransform(rotateX, (r) => `${r * 2.5}%`);
  const glintOpacity = useTransform(rotateX, [-10, 0, 12], [0.35, 0.5, 0.75]);
  const rimOpacity = useTransform(sy, [-0.5, 0.5], [1, 0.55]);
  const transform = useMotionTemplate`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto max-w-md [perspective:1100px] md:mx-0"
      initial={reduce ? false : { opacity: 0, y: 48, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div className="card-shadow" style={reduce ? undefined : { x: shadowX, y: shadowY }} />
      <motion.div className="relative [transform-style:preserve-3d]" style={reduce ? undefined : { transform }}>
        <div className="relative rounded-[2rem] border border-foreground/10 bg-foreground/5 p-1.5 [transform-style:preserve-3d]">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] border border-line shadow-[inset_0_1px_1px_rgba(241,236,228,0.06)] [transform:translateZ(12px)_scale(0.989)]">
            <div className="relative aspect-[4/5] w-full">
              <motion.div className="absolute inset-0 scale-[1.06]" style={reduce ? undefined : { x: photoX, y: photoY }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" loading="lazy" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              <div className="card-light absolute inset-0" />
              <motion.div className="card-glint" style={reduce ? undefined : { x: glintX, y: glintY, opacity: glintOpacity }} />
            </div>
          </div>
        </div>
        <motion.div className="card-rim" style={reduce ? undefined : { opacity: rimOpacity }} />
      </motion.div>
    </motion.div>
  );
}
