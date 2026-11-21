'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

type NavLink = { href: string; label: string; count?: number };

export function HeaderShell({
  homeHref,
  homeLabel,
  menuLabel,
  monogram,
  links,
  mobileLinks,
  socials,
  langSwitch,
  cv,
  cvLabel,
  cvHref,
}: {
  homeHref: string;
  homeLabel: string;
  menuLabel: string;
  monogram: string;
  links: NavLink[];
  mobileLinks: NavLink[];
  socials: ReactNode;
  langSwitch: ReactNode;
  cv: ReactNode;
  cvLabel: string;
  cvHref: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);

  // Hide while scrolling down, reveal on scroll up. Show the wordmark once the hero title is gone.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 160);
        last = y;
      }
      setPastHero(y > window.innerHeight * 0.45);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] transition-[translate] duration-500 ease-[var(--ease-expo)] sm:px-5 sm:pt-3 ${
        hidden && !open ? '-translate-y-[120%]' : 'translate-y-0'
      }`}
    >
      <div className="pointer-events-auto relative mx-auto max-w-[1360px]">
        <div className="absolute inset-0 rounded-2xl bg-[rgba(21,19,16,0.74)] shadow-[inset_0_1px_0_rgba(255,226,170,0.09),inset_0_0_0_1px_rgba(241,236,228,0.07),0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150" />
        <div className="relative px-3">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:gap-5">
              <a href={homeHref} className="group flex w-fit select-none items-center gap-2.5 rounded-lg py-1 pr-1">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 place-items-center rounded-[9px] bg-foreground font-display text-[13px] font-bold tracking-tight text-background transition-transform duration-300 group-hover:-rotate-6"
                >
                  {monogram}
                </span>
                <span
                  className={`font-display text-[1.0625rem] font-semibold tracking-tight text-foreground transition-[opacity,translate,filter] duration-500 ease-[var(--ease-expo)] ${
                    pastHero ? 'translate-x-0 opacity-100 blur-0' : '-translate-x-1.5 opacity-0 blur-[3px]'
                  }`}
                >
                  {monogram}
                  <span className="text-primary">.</span>
                </span>
                <span className="sr-only">{homeLabel}</span>
              </a>
              <nav aria-label="Main" className="hidden border-l border-foreground/[0.08] pl-3 md:block lg:pl-5">
                <ul className="-ml-3 flex items-center lg:-ml-3.5">
                  {links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="flex h-10 items-center rounded-full px-3 text-sm text-foreground/65 transition-colors duration-150 hover:text-foreground lg:px-3.5"
                      >
                        <span>{l.label}</span>
                        {l.count !== undefined && (
                          <span className="ml-1 hidden -translate-y-1.5 font-mono text-[10px] leading-none text-faint tabular-nums lg:inline">
                            {l.count}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center justify-end gap-2">
              <ul className="mr-1 hidden items-center border-r border-foreground/[0.08] pr-2 lg:flex">{socials}</ul>
              {langSwitch}
              {cv}
              <button
                type="button"
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((o) => !o)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground/[0.05] text-foreground shadow-[inset_0_0_0_1px_rgba(241,236,228,0.08)] transition-[scale,background-color] duration-150 active:scale-[0.96] md:hidden"
              >
                <span className="sr-only">{menuLabel}</span>
                <span className="relative block h-[10px] w-[18px]">
                  <span
                    className={`absolute inset-x-0 top-0 h-[1.5px] rounded-full bg-current transition-[translate,rotate] duration-300 ease-[var(--ease-expo)] ${
                      open ? 'translate-y-[4.25px] rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] rounded-full bg-current transition-[translate,rotate] duration-300 ease-[var(--ease-expo)] ${
                      open ? '-translate-y-[4.25px] -rotate-45' : ''
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.nav
                id="mobile-menu"
                aria-label="Mobile"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden md:hidden"
              >
                <ul className="border-t border-foreground/[0.08] pb-4 pt-2">
                  {mobileLinks.map((l, i) => (
                    <motion.li
                      key={l.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <a
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-12 items-center justify-between text-2xl font-medium tracking-tight text-foreground/85 hover:text-primary"
                      >
                        {l.label}
                        {l.count !== undefined && <span className="font-mono text-xs text-faint">{l.count}</span>}
                      </a>
                    </motion.li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-foreground/[0.08] py-4">
                  <ul className="flex items-center">{socials}</ul>
                  <a
                    href={cvHref}
                    download
                    className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-on-primary"
                  >
                    {cvLabel}
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
