/**
 * Every word, link and image on the homepage lives in this file.
 * Edit the values below to personalise the site; the layout adapts on its own.
 */
import type { ImageMetadata } from 'astro';
import officeOverview from '../assets/genix/office-overview.webp';
import officePlan from '../assets/genix/office-plan.webp';
import outdoorLayout from '../assets/genix/outdoor-layout.webp';
import portrait from '../assets/portrait.webp';

export interface SiteImage {
  src: ImageMetadata;
  alt: string;
}

export interface SiteProject {
  id: string;
  /** Huge title of the project panel. Keep it short: it is set in capitals across the full width. */
  title: string;
  type: string;
  year: string;
  stack: string;
  /** Full-bleed panel background. Without a cover, the panel shows a generated shader in `hue`. */
  cover?: SiteImage;
  /** Hue in degrees for the generated background when there is no cover. */
  hue?: number;
  /** Small thumbnails that pixel-reveal over the cover. */
  thumbs?: SiteImage[];
  link?: { label: string; href: string };
}

const genixOutdoor: SiteImage = {
  src: outdoorLayout,
  alt: 'Unity capture of an outdoor layout with paths, a bridge, and props placed by Genix',
};
const genixOffice: SiteImage = {
  src: officeOverview,
  alt: 'Perspective Unity capture of an office layout with desks, shelves, and lights placed by Genix',
};
const genixPlan: SiteImage = {
  src: officePlan,
  alt: 'Top-down Unity capture of an office layout, showing desk groups and the space between them',
};

export const site = {
  meta: {
    title: 'Philipp Sanktjohanser — Software Engineer',
    description: 'Philipp Sanktjohanser is a software engineering student with a background in games engineering. Developer tools, automation and software architecture.',
  },

  /** Monogram in the top-left corner and in the footer. */
  monogram: 'PS',
  name: { first: 'Philipp', last: 'Sanktjohanser' },
  /** Giant dissolving word in the hero. One word reads best. */
  heroWord: 'SANKTJOHANSER',
  /** Giant word at the very bottom of the page. */
  footerWord: 'PHILIPP',

  header: {
    tagline: ['Software engineering', 'M.Sc. student'],
    cta: { label: 'Get in touch', href: '#contact' },
  },

  hero: {
    lines: ['Building tools that make', 'complex work easier to reason about.'],
    hint: '(Scroll)',
  },

  about: {
    index: '/02',
    label: 'About',
    aside: ['Every detail,', 'from model to merge.'],
    statement: 'I’m a software engineering master’s student with a background in games engineering. I build developer tools and automation, and I care about the architectural choices that keep software understandable as it grows.',
  },

  /** The curved “CRT” screen under the about statement. */
  reel: {
    label: ['Selected work', '(2022 — 2026)'],
    image: genixOffice,
    caption: ['Scene geometry in,', 'placed levels out.'],
    link: { label: 'View on GitHub', href: 'https://github.com/possiphil/Genix' },
  },

  focus: {
    index: '/03',
    label: 'Focus',
    paragraphs: [
      'I like owning the technical side of a problem from the first sketch to the version people actually use. Getting involved early lets me test ideas, work through constraints and make decisions that keep the code aligned with what it is supposed to do.',
      'Behind every tool I put the same care into structure, reliability and maintainability, so the next person can change what I build.',
    ],
  },

  /** Rows of the list next to “Education”, styled like the original’s recognitions table. */
  education: {
    label: 'Education',
    rows: [
      { title: 'Software Engineering, M.Sc.', detail: 'LMU · TUM · Augsburg — Elite Graduate Program', value: 'Ongoing' },
      { title: 'Informatics: Games Engineering, B.Sc.', detail: 'Technical University of Munich', value: '2026' },
    ],
  },

  projectsLabel: 'Projects',
  projects: [
    {
      id: 'genix',
      title: 'Genix',
      type: 'Unity editor tool · Bachelor’s thesis',
      year: '2026',
      stack: 'C# · Unity',
      cover: genixOutdoor,
      thumbs: [genixOffice, genixPlan, genixOutdoor, genixOffice, genixPlan],
      link: { label: 'Case study', href: '/work/genix' },
    },
    // TODO: Add descriptions, years, stacks, covers and links for the projects below.
    { id: 'orchestrator', title: 'Orchestrator', type: 'Developer tooling', year: '—', stack: '—', hue: 188, link: { label: 'GitHub', href: 'https://github.com/possiphil' } },
    { id: 'optimizer', title: 'Optimizer', type: 'Application Optimizer · Automation', year: '—', stack: '—', hue: 24, link: { label: 'GitHub', href: 'https://github.com/possiphil' } },
    { id: 'crawler', title: 'Crawler', type: 'Automation', year: '—', stack: '—', hue: 262, link: { label: 'GitHub', href: 'https://github.com/possiphil' } },
  ] satisfies SiteProject[],

  skills: {
    index: '/04',
    label: 'Skills',
    aside: 'Every layer I like to work on',
    items: ['Python', 'C#', 'SQL', 'Unity', 'PostgreSQL', 'Architecture', 'Automation'],
  },

  profile: {
    index: '/05',
    label: 'Profile',
    statement: 'A software engineer shaped by games engineering. I enjoy problems where the structure matters as much as the result.',
    portrait: { src: portrait, alt: 'Portrait of Philipp Sanktjohanser' } satisfies SiteImage,
    /** Small labels scattered over the portrait. */
    tags: ['Philipp', 'Munich', 'Developer tools', 'github.com/possiphil'],
  },

  contact: {
    index: '/06',
    label: 'Contact',
    lines: ['Building something?', 'Let’s talk about it.'],
    // TODO: Add an email address. Without one, the large link points to `primary`.
    email: '' as string,
    primary: { label: 'github.com/possiphil', href: 'https://github.com/possiphil' },
    nav: [
      { label: 'Intro', href: '#top' },
      { label: 'About', href: '#about' },
      { label: 'Projects', href: '#projects' },
      { label: 'Skills', href: '#skills' },
      { label: 'Profile', href: '#profile' },
    ],
    socials: [
      { label: 'GitHub', href: 'https://github.com/possiphil' },
      // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/…' },
    ],
    credits: ['Design after Propagande Studio', 'Built with Astro, Three.js & GSAP'],
  },
};
