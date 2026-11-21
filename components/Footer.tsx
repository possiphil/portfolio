import { Mail } from 'lucide-react';
import { profile, socials, type Dictionary, type Locale } from '@/content/site';
import { SocialIcon } from '@/lib/brand';
import { homePath } from '@/lib/i18n';

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const nav = [
    { href: homePath(locale), label: t.nav.home },
    { href: '#projects', label: t.nav.projects },
    { href: '#skills', label: t.nav.stack },
    { href: '#journey', label: t.nav.journey },
    { href: '#about', label: t.nav.about },
    { href: '#contact', label: t.nav.contact },
  ];
  return (
    <footer className="relative border-t border-foreground/5 bg-gradient-to-b from-transparent to-black/40">
      <div className="mx-auto max-w-[1400px] px-6 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <a href={homePath(locale)} className="text-2xl font-semibold tracking-tight text-foreground">
              {profile.monogram}
              <span className="text-primary">.</span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/55">{t.footer.tagline}</p>
            <span className="glass-dark mt-4 inline-flex items-center gap-2 rounded-full !border-primary/30 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-xs text-foreground/65">{t.footer.status}</span>
            </span>
          </div>
          <nav className="md:col-span-3" aria-label={t.footer.navigation}>
            <h3 className="mb-4 font-mono text-xs text-faint">{t.footer.navigation}</h3>
            <ul className="space-y-0.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="inline-flex min-h-10 items-center text-sm text-foreground/70 transition-colors duration-200 hover:text-primary">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            <h3 className="mb-4 font-mono text-xs text-faint">{t.footer.contact}</h3>
            <a
              href={`mailto:${profile.email}`}
              className="mb-4 inline-flex min-h-10 items-center gap-2 text-sm text-foreground/70 transition-colors duration-200 hover:text-primary"
            >
              <Mail size={15} />
              {profile.email}
            </a>
            <ul className="flex flex-wrap items-center gap-2">
              {socials
                .filter((s) => s.href)
                .map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-foreground/60 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <SocialIcon name={s.key} size={15} />
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-foreground/5 pt-6 font-mono text-xs text-faint sm:flex-row">
          <span>
            © {new Date().getFullYear()} {profile.firstName} {profile.lastName}. {t.footer.rights}
          </span>
          <span>{profile.siteUrl.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>
    </footer>
  );
}
