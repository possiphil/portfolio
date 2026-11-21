import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Background } from '@/components/Background';
import { profile } from '@/content/site';

export default function NotFound() {
  return (
    <main className="relative grid min-h-[100svh] place-items-center px-6 text-center">
      <Background />
      <div>
        <p className="hero-rise mb-6 font-mono text-sm text-foreground/60">404 — page not found</p>
        <h1 className="mb-10 overflow-hidden">
          <span className="hero-mask block text-[clamp(4rem,14vw,10rem)] font-semibold leading-[0.85] tracking-tight">
            {profile.monogram}
            <span className="text-primary">.</span>
          </span>
        </h1>
        <Link
          href="/"
          className="hero-rise group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 font-medium text-on-primary transition-colors duration-200 [animation-delay:300ms] hover:bg-primary-hover active:scale-[0.98]"
        >
          Back home
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </main>
  );
}
