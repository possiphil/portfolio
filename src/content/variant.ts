import type { ImageMetadata } from 'astro';
import outdoorLayout from '../assets/genix/outdoor-layout.webp';
import portrait from '../assets/portrait.webp';
import { contact } from './media';
import { portfolio } from './portfolio';

/**
 * Everything the "snellenberg" homepage variant shows lives here.
 * Change copy, colors, links and images in this file; the layout picks them up.
 */

export interface VariantProject {
  title: string;
  category: string;
  /** Link for the row. Without one the cursor shows "Soon" and the row is not clickable. */
  href?: string;
  /** Background behind the image in the floating hover preview. Projects without an image show their title on it. */
  color: string;
  image?: ImageMetadata;
  alt?: string;
}

export const variant = {
  firstName: portfolio.firstName,
  lastName: portfolio.lastName,
  /** Hero background behind the portrait. Pick a tone that matches the photo's edges. */
  heroColor: '#141213',
  portrait,
  portraitAlt: `Portrait of ${portfolio.firstName} ${portfolio.lastName}`,

  /** The pill on the left edge of the hero. One entry per line. */
  location: ['Located', 'in', 'Germany'],
  /** The two lines on the right side of the hero. */
  role: ['Software Engineering', 'Student & Developer'],

  /** Preloader greetings, shown in order. */
  greetings: ['Hello', 'Hallo', 'Servus', 'Bonjour', 'Ciao', 'Olà', 'やあ', 'Hallå', 'Guten Tag'],

  intro: {
    phrase: 'I build tools that make complex work easier to reason about. The next person should be able to change what I build.',
    paragraph: 'Software engineering master’s student with a background in games engineering, focused on developer tools, automation and architecture that stays understandable.',
    button: { label: 'About me', href: contact.github },
  },

  nav: [
    { label: 'Home', href: '#top' },
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  projects: [
    {
      title: 'Genix',
      category: 'Unity Tool & Thesis',
      href: '/work/genix',
      color: '#706D63',
      image: outdoorLayout,
      alt: 'Outdoor layout placed by Genix',
    },
    {
      title: 'Orchestrator',
      category: 'Case study coming soon',
      color: '#413D3B',
    },
    {
      title: 'Application Optimizer',
      category: 'Case study coming soon',
      color: '#C9C2B4',
    },
    {
      title: 'Crawler',
      category: 'Case study coming soon',
      color: '#EFE8D3',
    },
  ] as VariantProject[],

  moreWork: { label: 'More work', href: contact.github },

  footer: {
    heading: ['Let’s work', 'together'],
    button: { label: 'Get in touch', href: contact.email ? `mailto:${contact.email}` : contact.github },
    pills: [
      ...(contact.email ? [{ label: contact.email, href: `mailto:${contact.email}` }] : []),
      { label: 'github.com/possiphil', href: contact.github },
    ],
    version: `${new Date().getFullYear()} © Edition`,
    timeZone: 'Europe/Berlin',
    socials: [
      { label: 'GitHub', href: contact.github },
      ...(contact.linkedin ? [{ label: 'LinkedIn', href: contact.linkedin }] : []),
    ],
  },
};

export const variantName = `${variant.firstName} ${variant.lastName}`;
