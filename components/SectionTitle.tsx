import { Reveal } from './Reveal';

export function SectionTitle({
  title,
  lead,
  size = 'lg',
  className = '',
}: {
  title: string;
  lead?: string;
  size?: 'lg' | 'md';
  className?: string;
}) {
  const h =
    size === 'lg'
      ? 'text-5xl sm:text-6xl md:text-7xl mb-4'
      : 'text-4xl sm:text-5xl leading-[1.02]';
  return (
    <div className={className}>
      <Reveal>
        <h2 className={`${h} font-semibold tracking-tight text-foreground`}>
          {title}
          <span className="text-primary">.</span>
        </h2>
      </Reveal>
      {lead && (
        <Reveal>
          <p
            className={
              size === 'lg'
                ? 'mb-16 max-w-2xl text-lg text-foreground/60 sm:mb-20 sm:text-xl'
                : 'mt-5 max-w-sm text-foreground/60'
            }
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
