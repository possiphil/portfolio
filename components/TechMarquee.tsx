import { marquee } from '@/content/site';
import { BrandIcon } from '@/lib/brand';
import { MarqueeController } from './MarqueeController';

function Group({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 gap-2.5 pr-2.5 sm:gap-3.5 sm:pr-3.5" aria-hidden={hidden || undefined}>
      {marquee.map((m) => (
        <li
          key={m.label}
          className="group/pill pill-surface relative flex shrink-0 items-center gap-2.5 rounded-full py-[9px] pl-3 pr-4 sm:py-[11px] sm:pl-[15px] sm:pr-5"
          style={{ ['--brand' as string]: m.brand ?? 'var(--foreground)' }}
        >
          <span className="relative size-4 shrink-0 text-foreground/60 transition-colors duration-200 group-hover/pill:text-[color:var(--brand)] sm:size-[18px]">
            <BrandIcon slug={m.icon} className="h-full w-full" />
          </span>
          <span className="whitespace-nowrap font-mono text-[13px] leading-5 text-foreground opacity-[0.62] transition-opacity duration-200 group-hover/pill:opacity-100 sm:text-sm">
            {m.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Infinite, edge-faded strip of tools. Pauses on hover and while off-screen. */
export function TechMarquee() {
  return (
    <section aria-label="Tech stack" className="relative py-[30px] sm:py-11">
      <MarqueeController className="relative [--loop:44s] sm:[--loop:38s]">
        <div className="relative overflow-hidden pb-4 pt-3 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_74%,transparent_90%)] sm:pb-[18px] sm:pt-3.5 sm:[mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
          <div className="flex w-max animate-marquee">
            <Group />
            <Group hidden />
            <Group hidden />
            <Group hidden />
          </div>
        </div>
      </MarqueeController>
    </section>
  );
}
