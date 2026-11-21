import { stack, type Dictionary } from '@/content/site';
import { CodeWindow } from './CodeWindow';
import { Reveal } from './Reveal';

export function Skills({ t }: { t: Dictionary }) {
  return (
    <section id="skills" className="relative px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-5">
          <Reveal>
            <h2 className="mb-5 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl 2xl:text-7xl">
              {t.skills.title}
              <span className="text-primary">.</span>
            </h2>
            <p className="max-w-sm text-lg text-foreground/60 sm:text-xl">{t.skills.lead}</p>
          </Reveal>
        </div>
        <Reveal className="md:col-span-7">
          <CodeWindow comment={t.skills.comment} stack={stack} />
        </Reveal>
      </div>
    </section>
  );
}
