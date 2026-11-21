import * as simpleIcons from 'simple-icons';
import type { SocialKey } from '@/content/site';

/**
 * Server-only helpers that inline brand SVGs at build time.
 * Never import this from a 'use client' file — pass the rendered nodes down instead.
 */

type SimpleIcon = { path: string; title: string };

function lookup(slug: string): SimpleIcon | undefined {
  const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
  return (simpleIcons as unknown as Record<string, SimpleIcon>)[key];
}

export function BrandIcon({ slug, size = 18, className }: { slug: string; size?: number; className?: string }) {
  const icon = lookup(slug);
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d={icon.path} />
    </svg>
  );
}

// simple-icons no longer ships LinkedIn, so it is drawn here.
const linkedinPath =
  'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z';

export function SocialIcon({ name, size = 16, className }: { name: SocialKey; size?: number; className?: string }) {
  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
        <path d={linkedinPath} />
      </svg>
    );
  }
  return <BrandIcon slug={name} size={size} className={className} />;
}
