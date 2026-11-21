import { ArrowUpRight, Download } from 'lucide-react';
import { profile, socials, type Dictionary } from '@/content/site';
import { SocialIcon } from '@/lib/brand';
import { ContactForm } from './ContactForm';
import { Reveal } from './Reveal';

export function Contact({ t }: { t: Dictionary }) {
  const c = t.contact;
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-16 sm:px-8 sm:py-20">
      <div className="relative mx-auto w-full max-w-[1400px]">
        <Reveal>
          <span className="mb-5 block font-mono text-xs text-muted">{c.eyebrow}</span>
          <p className="mb-4 text-lg text-foreground/60 sm:text-xl">{c.lead}</p>
        </Reveal>
        <Reveal>
          <a href={`mailto:${profile.email}`} className="group mb-10 inline-flex items-start gap-3 sm:mb-12 sm:gap-4">
            <span className="break-all text-[clamp(1.9rem,7vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
              {profile.email}
            </span>
            <ArrowUpRight
              className="mt-[0.4em] h-[clamp(1.5rem,4vw,3.5rem)] w-[clamp(1.5rem,4vw,3.5rem)] shrink-0 text-foreground/40 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
              strokeWidth={1.5}
            />
          </a>
        </Reveal>
        <Reveal>
          <div className="mb-20 flex flex-wrap items-center gap-3 sm:mb-28 sm:gap-4">
            <a
              href={profile.resume}
              download
              className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover active:scale-[0.98]"
            >
              <span>{c.download}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover:translate-y-0.5">
                <Download size={16} />
              </span>
            </a>
            {socials
              .filter((s) => s.href)
              .map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-foreground/5 px-5 py-3 text-foreground/80 transition duration-200 hover:border-primary/40 hover:bg-foreground/10 hover:text-primary"
                >
                  <SocialIcon name={s.key} size={16} />
                  <span>{s.label}</span>
                  <span className="sr-only">{c.newTab}</span>
                </a>
              ))}
          </div>
        </Reveal>
        <div className="grid items-start gap-10 md:grid-cols-12 md:gap-14">
          <Reveal className="md:col-span-4">
            <h2 className="mb-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {c.formTitle}
              <span className="text-primary">.</span>
            </h2>
            <p className="text-foreground/60">{c.formLead}</p>
          </Reveal>
          <Reveal className="md:col-span-8">
            <ContactForm
              email={profile.email}
              labels={{ name: c.name, email: c.email, message: c.message, send: c.send, privacy: c.privacy }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
