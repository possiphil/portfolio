import { Blocks, Bot, CodeXml, Cpu, Gamepad2, Mountain } from 'lucide-react';
import type { Dictionary } from '@/content/site';
import { Reveal } from './Reveal';

const icons = { code: CodeXml, cpu: Cpu, gamepad: Gamepad2, bot: Bot, blocks: Blocks, mountain: Mountain };

export function Interests({ t }: { t: Dictionary }) {
  return (
    <section id="interests" className="relative px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-[1400px]">
        <Reveal className="mb-12 sm:mb-16">
          <h2 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            {t.interests.title}
            <span className="text-primary">.</span>
          </h2>
        </Reveal>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {t.interests.items.map((item, i) => {
            const Icon = icons[item.icon];
            return (
              <Reveal key={item.label} y={8} delay={i * 0.06}>
                <div className="group flex items-center gap-3 rounded-full border border-line bg-foreground/[0.03] px-5 py-3 transition-colors duration-300 hover:border-primary/40 hover:bg-foreground/[0.06]">
                  <Icon size={18} className="text-muted transition-colors duration-300 group-hover:text-primary" />
                  <span className="text-foreground/85">{item.label}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
