/**
 * Everything the vshslv-style variant shows lives here.
 * Edit copy, links, the CV timeline and the cards on the work board in this file.
 * Fields marked optional are hidden on the page until you fill them in.
 */
import type { ImageMetadata } from 'astro';
import officeOverview from '../assets/genix/office-overview.webp';
import officePlan from '../assets/genix/office-plan.webp';
import outdoorLayout from '../assets/genix/outdoor-layout.webp';
import portrait from '../assets/portrait.webp';

export interface Link {
  label: string;
  href: string;
}

export interface TimelineEntry {
  /** e.g. "2024 — Present" */
  period: string;
  /** Right-aligned detail such as a city or "Remote". */
  place?: string;
  title: string;
  organisation: string;
  /** Short paragraphs under the heading. */
  paragraphs?: string[];
  /** Bullet points; rendered as a dotted list like the reference. */
  points?: string[];
}

export interface BoardCard {
  id: string;
  /** Title-bar label, e.g. "Genix". */
  label: string;
  /** Dimmed second word in the title bar, e.g. "Planner". */
  tag?: string;
  /** Position and width on the board in pixels. The board centre is 0, 0. */
  x: number;
  y: number;
  w: number;
  image?: { src: ImageMetadata; alt: string };
  title?: string;
  text?: string;
  meta?: string;
  link?: Link;
}

export const site = {
  name: 'Philipp Sanktjohanser',
  title: 'Philipp Sanktjohanser — Software Engineer',
  description: 'Philipp Sanktjohanser is a software engineering student with a background in games engineering, building developer tools and automation.',
  portrait: { src: portrait, alt: 'Portrait of Philipp Sanktjohanser' },
  /** Time zone for the clock in the bottom bar. */
  timeZone: 'Europe/Berlin',
};

/** Left column of the hero, one line each. */
export const role = ['Software Engineer', 'M.Sc. Student'];

/** The two list columns in the hero. */
export const columns: { label: string; items: string[] }[] = [
  { label: 'Focus', items: ['Developer Tools', 'Automation', 'Software Architecture', 'Procedural Systems'] },
  { label: 'Engineering', items: ['Python', 'C#', 'SQL', 'Unity', 'PostgreSQL'] },
];

/** Fourth hero column: a slowly scrolling ticker. Items with href become links. */
export const ticker: { label: string; items: { text: string; href?: string }[] } = {
  label: 'Index',
  items: [
    { text: 'M.Sc. Software Engineering' },
    { text: 'Elite Graduate Program' },
    { text: 'LMU · TUM · Augsburg' },
    { text: 'B.Sc. Games Engineering' },
    { text: 'TU Munich, 2026' },
    { text: 'Genix — Bachelor’s thesis', href: '/work/genix' },
    { text: 'Genix on GitHub', href: 'https://github.com/possiphil/Genix' },
    { text: 'Designer manual', href: 'https://github.com/possiphil/Genix/blob/main/Packages/com.possiphil.genix/Documentation~/index.md' },
    { text: 'Thesis evidence', href: 'https://github.com/possiphil/Genix-Thesis-Evidence' },
    { text: 'GitHub', href: 'https://github.com/possiphil' },
  ],
};

/** Lines typed one after another in the bottom bar. */
export const taglines = [
  'I build developer tools.',
  'I make complex work easier to reason about.',
  'I want the next person to be able to change what I build.',
];

/** Buttons in the top row of the profile panel. Leave href empty to hide one. */
export const contactLinks: Link[] = [
  { label: 'GitHub', href: 'https://github.com/possiphil' },
  { label: 'Email', href: '' },
  { label: 'LinkedIn', href: '' },
  { label: 'CV', href: '' },
];

export const profile = {
  paragraphs: [
    'Philipp Sanktjohanser. Software engineering master’s student with a background in games engineering.',
    'Interested in developer tools, automation, and the architectural choices that keep software understandable as it grows. Wrote a bachelor’s thesis on constraint-based procedural placement in Unity.',
  ],
  education: [
    {
      period: 'Ongoing',
      place: 'Munich',
      title: 'Software Engineering, M.Sc.',
      organisation: 'Elite Graduate Program',
      paragraphs: ['Joint programme of LMU Munich, the Technical University of Munich and the University of Augsburg.'],
    },
    {
      period: '— 2026',
      place: 'Munich',
      title: 'Informatics: Games Engineering, B.Sc.',
      organisation: 'Technical University of Munich',
      paragraphs: ['Bachelor’s thesis: Genix, a Unity editor tool for constraint-based procedural placement.'],
      points: [
        'Designed a staged placement planner that validates support, spacing, clearance and contact',
        'Built preview, apply and Undo integration for designers inside the Unity editor',
        'Evaluated 500 placement runs across isolated rules and integrated scenes',
      ],
    },
  ] satisfies TimelineEntry[] as TimelineEntry[],
  /** Add jobs here; the section appears as soon as the list is not empty. */
  experience: [] as TimelineEntry[],
  skills: [
    { label: 'Languages', items: ['Python', 'C#', 'SQL'] },
    { label: 'Tools & platforms', items: ['Unity', 'PostgreSQL'] },
    { label: 'Focus areas', items: ['Software architecture', 'Developer tools', 'Automation'] },
  ],
};

export interface PortfolioEntry {
  name: string;
  category: string;
  year?: string;
  summary: string;
  image?: { src: ImageMetadata; alt: string };
  links: Link[];
}

export const portfolioEntries: PortfolioEntry[] = [
  {
    name: 'Genix',
    category: 'Unity editor tool · Bachelor’s thesis',
    year: '2026',
    summary: 'A Unity editor tool that uses scene geometry and designer-authored rules to place objects in a level. Designers preview a plan, see why candidates were rejected, and apply it with Undo support.',
    image: { src: outdoorLayout, alt: 'Unity capture of an outdoor layout with paths, a bridge, and props placed by Genix' },
    links: [
      { label: 'Case study', href: '/work/genix' },
      { label: 'Source', href: 'https://github.com/possiphil/Genix' },
    ],
  },
  {
    name: 'Orchestrator',
    category: 'In progress',
    summary: 'Write-up coming soon.',
    links: [],
  },
  {
    name: 'Application Optimizer',
    category: 'In progress',
    summary: 'Write-up coming soon.',
    links: [],
  },
  {
    name: 'Crawler',
    category: 'In progress',
    summary: 'Write-up coming soon.',
    links: [],
  },
];

/** Cards on the draggable "Work in progress" board. */
export const boardCards: BoardCard[] = [
  {
    id: 'genix', label: 'Genix', tag: 'Unity', x: -380, y: -300, w: 760,
    image: { src: officeOverview, alt: 'Perspective Unity capture of an office layout with desks, shelves, and lights placed by Genix' },
  },
  {
    id: 'genix-about', label: 'Thesis', x: -380, y: 160, w: 250,
    text: 'A Unity editor tool that places objects from scene geometry and designer-authored rules. Built as my bachelor’s thesis at TUM.',
    meta: 'C# · Unity · 2026',
    link: { label: 'Case study', href: '/work/genix' },
  },
  {
    id: 'genix-plan', label: 'Planner', tag: 'Top-down', x: -100, y: 160, w: 330,
    image: { src: officePlan, alt: 'Top-down Unity capture of an office layout, showing desk groups and the space between them' },
  },
  {
    id: 'genix-outdoor', label: 'Outdoor', tag: 'Layout', x: 470, y: -120, w: 340,
    image: { src: outdoorLayout, alt: 'Unity capture of an outdoor layout with paths, a bridge, and props placed by Genix' },
  },
  {
    id: 'orchestrator', label: 'Orchestrator', tag: 'WIP', x: 470, y: 160, w: 260,
    text: 'Write-up coming soon.',
  },
  {
    id: 'optimizer', label: 'Application Optimizer', tag: 'WIP', x: 260, y: 400, w: 260,
    text: 'Write-up coming soon.',
  },
  {
    id: 'crawler', label: 'Crawler', tag: 'WIP', x: -100, y: 470, w: 240,
    text: 'Write-up coming soon.',
  },
  {
    id: 'source', label: 'Source', x: 470, y: -330, w: 260,
    text: 'Genix, its designer manual and the evidence for the thesis are public on GitHub.',
    link: { label: 'github.com/possiphil', href: 'https://github.com/possiphil' },
  },
];
