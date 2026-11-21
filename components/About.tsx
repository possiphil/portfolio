import { Gamepad2, GraduationCap, Languages, Layers, MapPin, Wrench } from 'lucide-react';
import { profile, type Dictionary } from '@/content/site';
import { Highlight } from './Highlight';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';
import { TiltCard } from './TiltCard';

const factIcons = { map: MapPin, graduation: GraduationCap, languages: Languages };
const pillarIcons = { wrench: Wrench, layers: Layers, gamepad: Gamepad2 };

export function About({ t }: { t: Dictionary }) {
  const a = t.about;
  return (
    <section id="about" className="relative px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-[1400px]">
        <SectionTitle title={a.title} lead={a.lead} />
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <TiltCard src={profile.portrait} alt={`${profile.firstName} ${profile.lastName}`} />
          </div>
          <div className="md:col-span-7">
            <div className="max-w-[60ch] space-y-6">
              <Reveal y={10} className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {a.facts.map((f) => {
                  const Icon = factIcons[f.icon];
                  return (
                    <span key={f.label} className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/55 sm:text-sm">
                      <Icon size={14} className="text-faint" />
                      {f.label}
                    </span>
                  );
                })}
              </Reveal>
              <Reveal y={14} delay={0.05}>
                <div className="space-y-6">
                  {a.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? 'text-lg leading-relaxed text-foreground/85 sm:text-xl'
                          : 'text-base leading-relaxed text-foreground/70 sm:text-lg'
                      }
                    >
                      <Highlight text={p} />
                    </p>
                  ))}
                </div>
              </Reveal>
              <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-3">
                {a.pillars.map((p, i) => {
                  const Icon = pillarIcons[p.icon];
                  return (
                    <Reveal key={p.title} y={10} delay={0.08 * i}>
                      <div className="group/pillar flex items-start gap-3">
                        <div className="pill-surface relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                          <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_16px_24px_-12px_rgba(0,0,0,0.9)] transition-opacity duration-200 group-hover/pillar:opacity-100" />
                          <span className="pillar-sheen pointer-events-none absolute -inset-px rounded-[inherit] opacity-60 transition-opacity duration-200 group-hover/pillar:opacity-100" />
                          <Icon size={18} className="relative text-primary transition-transform duration-300 group-hover/pillar:-translate-y-0.5" />
                        </div>
                        <div>
                          <h3 className="mb-0.5 text-sm font-medium text-foreground">{p.title}</h3>
                          <p className="text-xs text-foreground/60">{p.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
