'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Dictionary } from '@/content/site';

/** Pill in the bottom-right corner; hidden at the very top and while the contact section is on screen. */
export function FloatingContact({ t }: { t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const target = document.getElementById('contact');
    const io = target ? new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.05 }) : null;
    if (target) io!.observe(target);
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  const show = scrolled && !atContact;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="#contact"
            className="group flex h-11 items-center gap-2 rounded-full border border-foreground/15 bg-surface/90 px-4 text-sm font-medium text-foreground shadow-lg shadow-black/40 backdrop-blur-md transition-colors duration-200 hover:border-foreground/25 hover:bg-surface-2 active:scale-[0.98] sm:h-12 sm:px-5"
          >
            <Mail size={16} strokeWidth={1.5} className="shrink-0 text-muted transition-colors group-hover:text-primary" />
            <span className="whitespace-nowrap sm:hidden">{t.floating.short}</span>
            <span className="hidden whitespace-nowrap sm:inline">{t.floating.long}</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
