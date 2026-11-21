import { ArrowRight, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import { profile, type Dictionary } from '@/content/site';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';
import { TimelineRail } from './TimelineRail';

const kindIcons = { education: GraduationCap, work: Briefcase, project: BookOpen };

export function Journey({ t }: { t: Dictionary }) {
  const j = t.journey;
  return (
    <section id="journey" className="relative px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-[1400px]">
        <SectionTitle title={j.title} lead={j.lead} />
        <TimelineRail>
          {j.items.map((item) => {
            const Icon = kindIcons[item.kind];
            return (
              <div key={item.title} className="relative" data-timeline-item>
                <span
                  data-timeline-dot
                  className="absolute -left-5 top-7 h-3 w-3 -translate-x-1/2 rounded-full border border-foreground/30 bg-surface-2 ring-4 ring-background transition-[background-color,border-color,box-shadow] duration-500 data-[on=true]:border-primary data-[on=true]:bg-primary data-[on=true]:shadow-[0_0_14px_var(--primary-glow)] sm:-left-7"
                />
                <Reveal>
                  <div className="surface-card group rounded-2xl p-5 sm:p-6 md:p-8">
                    <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted transition-colors duration-300 group-hover:text-primary sm:h-16 sm:w-16 sm:rounded-xl md:h-20 md:w-20">
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="mb-1.5 inline-block font-mono text-xs text-muted">{j.kinds[item.kind]}</span>
                          <h3 className="mb-1.5 text-lg font-normal leading-tight text-foreground sm:text-xl md:text-2xl">{item.title}</h3>
                          <div className="mb-1 text-foreground/60">{item.org}</div>
                          {item.note && <p className="text-xs text-foreground/50 sm:text-sm">{item.note}</p>}
                        </div>
                      </div>
                      <div className="flex-shrink-0 sm:text-right">
                        <div className="whitespace-nowrap font-mono text-2xl font-medium leading-none text-foreground tabular-nums sm:text-3xl md:text-4xl">
                          {item.date}
                        </div>
                        {item.duration && <div className="mt-1.5 font-mono text-xs text-faint">{item.duration}</div>}
                      </div>
                    </div>
                    <p className="max-w-[68ch] text-sm leading-relaxed text-foreground/70 md:text-base">{item.text}</p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </TimelineRail>
        <Reveal className="mt-12 pl-10 sm:pl-14">
          <a
            href={profile.resume}
            download
            className="group inline-flex items-center gap-2 text-foreground/70 transition-colors hover:text-primary"
          >
            {j.cta}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
