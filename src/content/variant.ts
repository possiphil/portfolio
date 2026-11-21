import type { ImageMetadata } from 'astro';
import officeOverview from '../assets/genix/office-overview.webp';
import officePlan from '../assets/genix/office-plan.webp';
import outdoorLayout from '../assets/genix/outdoor-layout.webp';
import portrait from '../assets/portrait.webp';
import terrainStudy from '../assets/terrain-study.webp';
import { contact } from './media';
import { portfolio } from './portfolio';

/**
 * Everything the "snellenberg" variant shows lives here: copy, colors, links,
 * projects and images for every page. Layout and animation pick it up.
 */

export interface CaseBlock {
  /** Without an image the block shows a "coming soon" placeholder. */
  image?: ImageMetadata;
  alt: string;
  /** Frame drawn around the image. */
  device: 'browser' | 'laptop' | 'none';
  /** Section background behind the block. */
  background: string;
}

export interface VariantProject {
  slug: string;
  title: string;
  /** Shown in lists as "Services" and on the case page under "Role / Services". */
  services: string;
  location: string;
  year: string;
  /** Group used by the filter buttons on /work. */
  filter: string;
  /** Background behind the image in hover previews and tiles. */
  color: string;
  image?: ImageMetadata;
  alt?: string;
  summary?: string;
  /** Lines in the middle column of the case intro. */
  credits: string[];
  /** Round button on the case intro image (the original uses "Live site"). */
  link?: { label: string; href: string };
  blocks: CaseBlock[];
}

export interface ArchiveItem {
  title: string;
  location: string;
  services: string;
  year: string;
  href?: string;
  /** Text in the cursor circle. */
  label?: string;
}

const github = contact.github;
const email = contact.email;

export const site = {
  firstName: portfolio.firstName,
  lastName: portfolio.lastName,
  portrait,
  portraitAlt: `Portrait of ${portfolio.firstName} ${portfolio.lastName}`,
  description: portfolio.description,
  timeZone: 'Europe/Berlin',
  version: `${new Date().getFullYear()} © Edition`,
  location: 'Germany',
  socials: [
    { label: 'GitHub', href: github },
    ...(contact.linkedin ? [{ label: 'LinkedIn', href: contact.linkedin }] : []),
  ],
  /** Pill buttons in the footer and the contact details on /contact. */
  contactLinks: [
    ...(email ? [{ label: email, href: `mailto:${email}` }] : []),
    { label: 'github.com/possiphil', href: github },
  ],
  email,
};

export const nav = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'work', label: 'Work', href: '/work' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'contact', label: 'Contact', href: '/contact' },
] as const;

export type NavKey = (typeof nav)[number]['key'] | 'none';

export const home = {
  /** Hero background behind the portrait. Pick a tone that matches the photo's edges. */
  heroColor: '#141213',
  location: ['Located', 'in', site.location],
  role: ['Software Engineering', 'Student & Developer'],
  greetings: ['Hello', 'Hallo', 'Servus', 'Bonjour', 'Ciao', 'Olà', 'やあ', 'Hallå', 'Guten Tag'],
  intro: {
    phrase: 'I build tools that make complex work easier to reason about. The next person should be able to change what I build.',
    paragraph: 'Software engineering master’s student with a background in games engineering, focused on developer tools, automation and architecture that stays understandable.',
    button: 'About me',
  },
  moreWork: 'More work',
};

export const projects: VariantProject[] = [
  {
    slug: 'genix',
    title: 'Genix',
    services: 'Unity Tool & Thesis',
    location: 'Germany',
    year: '2026',
    filter: 'Case studies',
    color: '#706D63',
    image: outdoorLayout,
    alt: 'Outdoor layout placed by Genix',
    summary: 'A Unity editor tool that uses scene geometry and designer-authored rules to place objects in a level. Built as my bachelor’s thesis at TUM.',
    credits: ['Bachelor’s thesis · TUM', 'C# · Unity'],
    link: { label: 'Source code', href: 'https://github.com/possiphil/Genix' },
    blocks: [
      { image: officeOverview, alt: 'Perspective Unity capture of an office layout placed by Genix', device: 'laptop', background: '#E6E8EB' },
      { image: officePlan, alt: 'Top-down Unity capture of the same office layout', device: 'none', background: '#E6E8EB' },
      { image: outdoorLayout, alt: 'Outdoor layout with paths, a bridge and props placed by Genix', device: 'browser', background: '#D4D6D8' },
    ],
  },
  {
    slug: 'orchestrator',
    title: 'Orchestrator',
    services: 'Case study coming soon',
    location: 'Germany',
    year: 'Ongoing',
    filter: 'In progress',
    color: '#413D3B',
    credits: ['Details coming soon'],
    blocks: [{ alt: 'Image coming soon', device: 'laptop', background: '#E6E8EB' }],
  },
  {
    slug: 'application-optimizer',
    title: 'Application Optimizer',
    services: 'Case study coming soon',
    location: 'Germany',
    year: 'Ongoing',
    filter: 'In progress',
    color: '#C9C2B4',
    credits: ['Details coming soon'],
    blocks: [{ alt: 'Image coming soon', device: 'laptop', background: '#E6E8EB' }],
  },
  {
    slug: 'crawler',
    title: 'Crawler',
    services: 'Case study coming soon',
    location: 'Germany',
    year: 'Ongoing',
    filter: 'In progress',
    color: '#EFE8D3',
    credits: ['Details coming soon'],
    blocks: [{ alt: 'Image coming soon', device: 'laptop', background: '#E6E8EB' }],
  },
];

export const work = {
  heading: ['Selected projects', 'and experiments'],
  archiveLabel: 'Archive',
  columns: ['Project', 'Location', 'Services', 'Year'],
};

export const archive = {
  heading: 'Archive',
  items: [
    { title: 'Genix', location: 'Germany', services: 'Unity Tool & Thesis', year: '2026', href: 'https://github.com/possiphil/Genix', label: 'GitHub' },
    { title: 'Genix Thesis Evidence', location: 'Germany', services: 'Thesis Evaluation', year: '2026', href: 'https://github.com/possiphil/Genix-Thesis-Evidence', label: 'GitHub' },
    { title: 'Orchestrator', location: 'Germany', services: 'In progress', year: 'Ongoing' },
    { title: 'Application Optimizer', location: 'Germany', services: 'In progress', year: 'Ongoing' },
    { title: 'Crawler', location: 'Germany', services: 'In progress', year: 'Ongoing' },
  ] as ArchiveItem[],
};

export const about = {
  heading: ['Software that stays', 'easy to change'],
  paragraph: portfolio.about.paragraph,
  exploring: 'Always learning',
  image: portrait,
  imageAlt: `Portrait of ${portfolio.firstName} ${portfolio.lastName}`,
  servicesHeading: 'What I work with',
  services: portfolio.technicalAreas.map((area) => ({
    title: area.label,
    text: area.items.join(', '),
  })),
  highlight: {
    image: terrainStudy,
    imageAlt: 'Wireframe terrain study',
    badge: 'M.Sc.',
    heading: ['Elite Graduate', 'Program'],
    text: portfolio.education
      .map((entry) => `${entry.degree}: ${entry.institutions}${entry.program ? ` (${entry.program})` : ''}, ${entry.date.toLowerCase()}.`)
      .join(' '),
  },
};

export const contactPage = {
  heading: ['Let’s start a', 'project together'],
  fields: [
    { name: 'name', label: 'What’s your name?', placeholder: 'John Doe *', required: true, type: 'text' as const },
    { name: 'email', label: 'What’s your email?', placeholder: 'john@doe.com *', required: true, type: 'email' as const },
    { name: 'organization', label: 'What’s the name of your organization?', placeholder: 'John & Doe ®', required: false, type: 'text' as const },
    { name: 'topic', label: 'What are you looking for?', placeholder: 'Internship, Collaboration, Project ...', required: false, type: 'text' as const },
    { name: 'message', label: 'Your message', placeholder: `Hello ${portfolio.firstName}, can you help me with ... *`, required: true, type: 'textarea' as const },
  ],
  submit: 'Send it!',
  details: [
    `${portfolio.firstName} ${portfolio.lastName}`,
    'Software Engineering, M.Sc. (ongoing)',
    `Location: ${site.location}`,
  ],
};

export const footer = {
  heading: ['Let’s work', 'together'],
  button: 'Get in touch',
};

/** Label shown on the transition curtain for each route. */
export const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/work': 'Work',
  '/about': 'About',
  '/contact': 'Contact',
  '/archive': 'Archive',
  ...Object.fromEntries(projects.map((project) => [`/work/${project.slug}`, project.title])),
};

export const fullName = `${site.firstName} ${site.lastName}`;
