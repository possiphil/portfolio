import { Plus } from 'lucide-react';
import type { Dictionary } from '@/content/site';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';

export function Faq({ t }: { t: Dictionary }) {
  return (
    <section id="faq" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <SectionTitle title={t.faq.title} lead={t.faq.lead} size="md" className="lg:col-span-4" />
          <div className="flex flex-col divide-y divide-foreground/5 border-y border-foreground/5 lg:col-span-8">
            {t.faq.items.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.04}>
                <details className="group py-6" name="faq">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 marker:content-none [&::-webkit-details-marker]:hidden">
                    <h3 className="text-lg text-foreground/90 transition-colors duration-200 group-hover:text-primary sm:text-xl">{item.q}</h3>
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-foreground/50 transition duration-200 group-open:rotate-45 group-hover:border-primary/40 group-hover:text-primary">
                      <Plus size={16} />
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl pr-14 leading-relaxed text-foreground/60">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
