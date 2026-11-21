import { ArrowRight, Mail } from 'lucide-react';
import { profile, projects, type Dictionary, type Locale } from '@/content/site';
import { HeroParallax, ScrollIndicator } from './HeroMotion';

export function Hero({ t }: { locale: Locale; t: Dictionary }) {
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <section className="relative overflow-hidden md:min-h-[100svh]">
      {/* Mobile: image on top, fading into the page */}
      <div
        className="absolute inset-x-0 -top-[3vw] aspect-[4/5] overflow-hidden md:hidden"
        style={{
          maskImage:
            'linear-gradient(to bottom, #000 38%, rgba(0,0,0,.88) 46%, rgba(0,0,0,.64) 54%, rgba(0,0,0,.38) 62%, rgba(0,0,0,.16) 70%, transparent 80%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover [filter:saturate(.85)_sepia(.12)_brightness(.82)]"
          style={{ objectPosition: profile.heroImagePosition }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Desktop: either a right-hand portrait or a full-bleed scene, both fading into the page */}
      {profile.heroLayout === 'portrait' ? (
        <HeroParallax
          className="absolute inset-y-0 right-0 hidden w-[min(62vw,72rem)] overflow-hidden md:block"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,.35) 14%, rgba(0,0,0,.8) 30%, #000 44%), linear-gradient(to bottom, #000 62%, rgba(0,0,0,.6) 80%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover [filter:saturate(.85)_sepia(.12)_brightness(.82)]"
            style={{ objectPosition: profile.heroImagePosition }}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_60%_35%,transparent_35%,rgba(12,10,8,0.6))]" />
        </HeroParallax>
      ) : (
        <HeroParallax
          className="absolute inset-0 hidden overflow-hidden md:block"
          style={{
            maskImage:
              'linear-gradient(to bottom, #000 66%, rgba(0,0,0,.94) 71%, rgba(0,0,0,.78) 76%, rgba(0,0,0,.5) 83%, rgba(0,0,0,.22) 91%, transparent 100%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: profile.heroImagePosition }}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,10,8,0.92)_0%,rgba(12,10,8,0.8)_16%,rgba(12,10,8,0.64)_30%,rgba(12,10,8,0.44)_38%,rgba(12,10,8,0.22)_45%,rgba(12,10,8,0.08)_51%,transparent_56%)]" />
        </HeroParallax>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center px-6 pb-8 pt-[min(78vw,30rem)] text-center md:min-h-[100svh] md:items-start md:py-28 md:pl-[max(4rem,7vw)] md:text-left">
        <p className="hero-rise mb-8 font-mono text-xs text-foreground/75 sm:text-sm" style={delay(100)}>
          {t.hero.eyebrow}
        </p>
        <h1 className="mb-5">
          <span className="mb-3 block overflow-hidden">
            <span className="hero-mask block pb-[0.08em] text-[clamp(4rem,16vw,13rem)] font-semibold leading-[0.85] tracking-tight text-foreground md:text-[clamp(4rem,11vw,9.5rem)]">
              {profile.monogram}
              <span className="text-primary">.</span>
            </span>
          </span>
          <span className="hero-rise block text-xl tracking-tight text-foreground/80 sm:text-2xl" style={delay(340)}>
            {profile.firstName} {profile.lastName}
          </span>
          <span className="sr-only">, {t.hero.role}</span>
        </h1>
        <p
          className="hero-rise mb-9 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg md:max-w-[30rem]"
          style={delay(460)}
        >
          <span className="font-medium text-foreground">{t.hero.role}</span>. {t.hero.lead}
        </p>
        <div
          className="hero-rise flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start"
          style={delay(580)}
        >
          <a
            href="#projects"
            className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover active:scale-[0.98]"
          >
            <span>{t.hero.ctaPrimary}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowRight size={16} />
            </span>
          </a>
          <a
            href="#contact"
            className="hidden items-center gap-2 rounded-full border border-line bg-foreground/5 px-6 py-3 text-foreground/80 transition duration-200 hover:border-primary/40 hover:bg-foreground/10 hover:text-foreground sm:inline-flex"
          >
            <Mail size={16} />
            <span>{t.hero.ctaSecondary}</span>
          </a>
        </div>

        {/* Mobile: swipeable project strip */}
        <ul
          className="hero-rise -mx-6 mt-10 flex snap-x snap-mandatory gap-3 self-stretch overflow-x-auto scroll-px-6 px-6 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          style={delay(700)}
        >
          {projects.map((p) => (
            <li key={p.id} className="w-[68vw] max-w-[17rem] shrink-0 snap-start">
              <a
                href="#projects"
                className="block overflow-hidden rounded-xl border border-line bg-surface-2 text-left transition-transform active:scale-[0.98]"
              >
                <span className="relative block aspect-[16/10]">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.75]" loading="lazy" />
                  ) : (
                    <span className="cover-placeholder absolute inset-0" />
                  )}
                </span>
                <span className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <span className="truncate font-medium text-foreground">{p.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-foreground/65">
                    {t.projects.status[p.status]}
                    <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'wip' ? 'bg-foreground/45' : 'bg-primary'}`} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ScrollIndicator />
    </section>
  );
}
