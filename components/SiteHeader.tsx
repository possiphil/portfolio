import { Download } from 'lucide-react';
import { profile, projects, socials, type Dictionary, type Locale } from '@/content/site';
import { SocialIcon } from '@/lib/brand';
import { homePath } from '@/lib/i18n';
import { HeaderShell } from './HeaderShell';

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: '#projects', label: t.nav.projects, count: projects.length },
    { href: '#journey', label: t.nav.journey },
    { href: '#skills', label: t.nav.stack },
  ];
  const mobileLinks = [...links, { href: '#about', label: t.nav.about }, { href: '#contact', label: t.nav.contact }];

  const socialList = socials
    .filter((s) => s.href)
    .map((s) => (
      <li key={s.key}>
        <a
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${s.label} ${t.contact.newTab}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/45 transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.96]"
        >
          <SocialIcon name={s.key} size={15} />
        </a>
      </li>
    ));

  const langSwitch = (
    <div className="flex items-center rounded-full bg-foreground/[0.05] p-[3px] shadow-[inset_0_0_0_1px_rgba(241,236,228,0.08)]">
      {(['en', 'de'] as const).map((l) => (
        <a
          key={l}
          href={homePath(l)}
          hrefLang={l}
          aria-current={l === locale ? 'true' : undefined}
          className={`flex h-[34px] min-w-10 select-none items-center justify-center rounded-full px-2.5 font-mono text-xs uppercase tracking-wide transition-colors duration-150 ${
            l === locale
              ? 'bg-foreground/[0.12] text-foreground shadow-[inset_0_1px_0_rgba(241,236,228,0.08)]'
              : 'text-foreground/55 hover:text-foreground'
          }`}
        >
          {l}
        </a>
      ))}
    </div>
  );

  const cv = (
    <a
      href={profile.resume}
      download
      className="group hidden h-10 items-center gap-2 rounded-full bg-foreground/[0.05] pl-4 pr-3.5 text-sm font-medium text-foreground/90 shadow-[inset_0_0_0_1px_rgba(241,236,228,0.1)] transition-colors hover:bg-foreground/[0.09] hover:text-foreground lg:inline-flex"
    >
      {t.nav.cv}
      <Download size={15} className="text-muted transition-[translate,color] duration-200 group-hover:translate-y-0.5 group-hover:text-primary" />
    </a>
  );

  return (
    <HeaderShell
      homeHref={homePath(locale)}
      homeLabel={t.nav.home}
      menuLabel={t.nav.menu}
      monogram={profile.monogram}
      links={links}
      mobileLinks={mobileLinks}
      socials={socialList}
      langSwitch={langSwitch}
      cv={cv}
      cvLabel={t.contact.download}
      cvHref={profile.resume}
    />
  );
}
