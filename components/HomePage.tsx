import type { Locale } from '@/content/site';
import { getDictionary } from '@/lib/i18n';
import { About } from './About';
import { Background } from './Background';
import { Contact } from './Contact';
import { Faq } from './Faq';
import { FloatingContact } from './FloatingContact';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { Interests } from './Interests';
import { Journey } from './Journey';
import { Projects } from './Projects';
import { SiteHeader } from './SiteHeader';
import { Skills } from './Skills';
import { TechMarquee } from './TechMarquee';

export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <>
      {locale !== 'en' && (
        // One root layout serves both languages; correct <html lang> before paint.
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />
      )}
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-primary px-5 py-3 font-medium text-on-primary transition-transform duration-200 focus:translate-y-0"
      >
        {t.nav.skip}
      </a>
      <Background />
      <SiteHeader locale={locale} t={t} />
      <main id="main">
        <Hero locale={locale} t={t} />
        <TechMarquee />
        <About t={t} />
        <Skills t={t} />
        <Projects t={t} />
        <Journey t={t} />
        <Interests t={t} />
        <Faq t={t} />
        <Contact t={t} />
      </main>
      <Footer locale={locale} t={t} />
      <FloatingContact t={t} />
    </>
  );
}
