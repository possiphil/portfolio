'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Editor-style window that prints the stack as a TS object, line by line, when it scrolls into view. */
export function CodeWindow({ comment, stack }: { comment: string; stack: Record<string, string[]> }) {
  const reduce = useReducedMotion();

  const lines: ReactNode[] = [
    <span key="c" className="italic text-foreground/60">{comment}</span>,
    <span key="o">
      <span className="text-primary/80">const</span> <span className="text-foreground/90">stack</span>{' '}
      <span className="text-foreground/65">= {'{'}</span>
    </span>,
    ...Object.entries(stack).map(([key, values]) => (
      <span key={key} className="inline-block pl-4 align-top text-foreground/65">
        <span className="text-foreground/85">{key}</span>: [
        {values.map((v, i) => (
          <span key={v}>
            <span className="text-[#e9c46a]">&apos;{v}&apos;</span>
            {i < values.length - 1 ? ', ' : ''}
          </span>
        ))}
        ],
      </span>
    )),
    <span key="e" className="text-foreground/65">
      {'}'}
      <motion.span
        aria-hidden="true"
        className="ml-1 inline-block h-[1.1em] w-[0.55ch] translate-y-[0.2em] bg-primary"
        animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </span>,
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface/80 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-line bg-foreground/[0.02] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-foreground/15" />
        <span className="h-3 w-3 rounded-full bg-foreground/15" />
        <span className="h-3 w-3 rounded-full bg-primary/60" />
        <span className="ml-3 font-mono text-xs text-faint">stack.ts</span>
      </div>
      <motion.div
        className="overflow-x-auto p-5 font-mono text-[13px] leading-7 sm:p-6 sm:text-sm"
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
      >
        {lines.map((line, i) => (
          <motion.div
            key={i}
            className="-mx-2 flex gap-4 rounded px-2 hover:bg-foreground/[0.02]"
            variants={{
              hidden: { opacity: 0, x: -6 },
              show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            <span className="w-[2ch] shrink-0 select-none text-right text-foreground/45">{i + 1}</span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{line}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
