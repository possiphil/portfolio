'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useRef } from 'react';
import type { Dictionary, Project } from '@/content/site';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Desktop: the section pins and vertical scroll drives a horizontal track (GSAP ScrollTrigger).
 * Mobile / reduced motion: a plain vertical stack.
 */
export function ProjectsTrack({
  projects,
  copy,
  allHref,
}: {
  projects: Project[];
  copy: Dictionary['projects'];
  allHref?: string;
}) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);

        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // Cards ease in from a slight scale/offset as they cross into view.
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.35, scale: 0.92, y: 24 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 100%',
                end: 'left 55%',
                scrub: true,
              },
            },
          );
          const media = card.querySelector<HTMLElement>('[data-media]');
          if (media) {
            gsap.fromTo(
              media,
              { xPercent: -6 },
              {
                xPercent: 6,
                ease: 'none',
                scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
              },
            );
          }
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="projects" className="relative md:h-[100dvh] md:overflow-hidden">
      <div
        ref={track}
        className="flex flex-col gap-10 px-6 py-28 sm:px-8 md:h-full md:flex-row md:flex-nowrap md:items-center md:gap-0 md:py-0 md:pl-[max(2rem,calc((100vw-1400px)/2))] md:will-change-transform"
      >
        <div className="md:flex md:h-full md:w-[58vw] md:shrink-0 md:flex-col md:justify-center md:pr-[6vw]">
          <span className="mb-4 block font-mono text-xs text-muted">{copy.eyebrow}</span>
          <h2 className="mb-6 text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-8xl">
            {copy.title}
            <span className="text-primary">.</span>
          </h2>
          <p className="max-w-md text-lg text-foreground/60 sm:text-xl">{copy.lead}</p>
        </div>

        {projects.map((p) => (
          <div key={p.id} data-card className="w-full md:mr-[4vw] md:w-[44vw] md:max-w-[40rem] md:shrink-0">
            <ProjectCard project={p} copy={copy} />
          </div>
        ))}

        {allHref && (
          <div data-card className="w-full md:mr-[max(2rem,calc((100vw-1400px)/2))] md:w-[22vw] md:min-w-[16rem] md:shrink-0">
            <a
              href={allHref}
              target="_blank"
              rel="noreferrer"
              className="group flex aspect-[2/1] flex-col justify-between rounded-2xl border border-dashed border-foreground/15 p-6 transition-colors duration-300 hover:border-primary/50 md:aspect-[1/1]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight size={18} />
              </span>
              <span className="text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {copy.all}
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, copy }: { project: Project; copy: Dictionary['projects'] }) {
  const item = copy.items[p.id] ?? { subtitle: '', summary: '' };
  const video = useRef<HTMLVideoElement>(null);
  const visibleTags = 4;

  return (
    <article
      className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-2 sm:aspect-[16/9] sm:justify-end md:aspect-[2/1]"
      onPointerEnter={() => video.current?.play().catch(() => {})}
      onPointerLeave={() => video.current?.pause()}
    >
      <div className="relative aspect-[2/1] overflow-hidden sm:absolute sm:inset-0 sm:-z-10 sm:aspect-auto">
        <div data-media className="absolute -inset-x-[8%] inset-y-0">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover brightness-[0.72] saturate-[0.9] transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:brightness-90"
              style={{ objectPosition: p.imagePosition }}
            />
          ) : (
            <div className="cover-placeholder absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
              <span className="absolute right-[10%] top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[clamp(3rem,7vw,6rem)] font-bold leading-none tracking-tight text-foreground/[0.06]">
                {p.name}
              </span>
            </div>
          )}
          {p.video && (
            <video
              ref={video}
              src={p.video}
              muted
              loop
              playsInline
              preload="none"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100"
            />
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 hidden bg-gradient-to-t from-background via-background/60 to-transparent sm:block" />

      <span className="pointer-events-none absolute left-3 top-3 z-[2] flex items-center gap-2 rounded-full border border-foreground/15 bg-background/80 px-3 py-1.5 font-mono text-xs text-foreground/90 backdrop-blur-md sm:left-4 sm:top-4">
        {copy.status[p.status]}
        <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'wip' ? 'bg-foreground/45' : 'bg-primary'}`} />
      </span>

      {p.href && (
        <div className="absolute right-3 top-3 z-10 flex gap-2 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100 sm:right-4 sm:top-4">
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${copy.open}: ${p.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      )}

      <div className="p-5 sm:p-7 md:p-9">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {p.href ? (
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 transition-colors after:absolute after:inset-0 after:z-[1] after:content-[''] group-hover:text-primary focus-visible:outline-none"
            >
              {p.name}
            </a>
          ) : (
            <span className="line-clamp-2">{p.name}</span>
          )}
          <span className="mt-1 block text-base font-normal tracking-normal text-foreground/60">{item.subtitle}</span>
        </h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-foreground/70 sm:hidden">{item.summary}</p>
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {p.tags.slice(0, visibleTags).map((tag, i) => (
            <span
              key={tag}
              className={`${i >= 2 ? 'hidden sm:inline-flex' : 'inline-flex'} rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-xs text-foreground/75 sm:border-foreground/10 sm:bg-black/45 sm:backdrop-blur-md`}
            >
              {tag}
            </span>
          ))}
          {p.tags.length > visibleTags && (
            <span className="font-mono text-xs text-faint">+ {p.tags.length - visibleTags}</span>
          )}
        </div>
      </div>
    </article>
  );
}
