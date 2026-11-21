/**
 * All personal content lives here. Change texts, colours, cards and links in this
 * file; the layout and the motion system pick everything up automatically.
 */
import type { ImageMetadata } from 'astro';
import { contact, media, type ProjectMedia } from './media';
import terrain from '../assets/terrain-study.webp';

export const person = {
  firstName: 'Philipp',
  lastName: 'Sanktjohanser',
  /** First half of the logo: "sanktjohanser." + rotating suffix. */
  logoName: 'sanktjohanser',
  /** Suffixes the logo cycles through. The first one is the real domain ending. */
  logoSuffixes: ['dev', 'projects', 'education', 'skills', 'experience', 'contact'],
  role: 'Software engineering student',
  description:
    'Philipp Sanktjohanser is a software engineering student with a background in games engineering, building developer tools and automation.',
  /** Letters revealed over the portrait on hover, one row per entry. */
  portraitOverlay: ['about me', 'who i am', 'what i build'],
  version: '2.0.0',
};

export const fullName = `${person.firstName} ${person.lastName}`;

/** A wave tile: background gradient + one or two wave layers drawn as SVG. */
export interface Palette {
  from: string;
  to: string;
  wave: [string, string];
  crest?: [string, string];
  ink: string;
}

export interface CategoryCard {
  title: string;
  description?: string;
  href?: string;
  /** large = 2×2, wide = 2×1, small = 1×1 */
  size?: 'small' | 'wide' | 'large';
  kind: 'image' | 'icon' | 'list' | 'text';
  image?: ProjectMedia;
  /** Icon tiles: emoji-free glyph name from components/Glyph.astro */
  glyph?: string;
  palette?: Palette;
  items?: { title: string; description?: string; href?: string }[];
}

export interface Category {
  slug: string;
  title: string;
  /** Tile label on the homepage (with the trailing dot). */
  label: string;
  tagline: string;
  intro: string;
  palette: Palette;
  cards: CategoryCard[];
}

const palettes = {
  ocean: { from: '#3d6fb6', to: '#2c5597', wave: ['#2fb7aa', '#3cc3b0'], ink: '#173a5c' },
  lagoon: { from: '#1f9289', to: '#2aa196', wave: ['#f2c661', '#e9b247'], ink: '#4b3610' },
  berry: { from: '#7b2a85', to: '#d22a51', wave: ['#c3226a', '#e0324d'], crest: ['#9a2779', '#b8296a'], ink: '#3a0f2c' },
  ember: { from: '#d83a4c', to: '#e2564a', wave: ['#ee8a4c', '#f2a24b'], crest: ['#c52c5c', '#d63a51'], ink: '#4a1218' },
  sunset: { from: '#f0a246', to: '#ea8945', wave: ['#e2564b', '#d8434f'], crest: ['#eb7446', '#e3654a'], ink: '#4a2010' },
} satisfies Record<string, Palette>;

export const categories: Category[] = [
  {
    slug: 'projects',
    title: 'Projects',
    label: 'projects.',
    tagline: 'things i have built.',
    intro: 'Tools, prototypes and research software. Most of it is about making complex work easier to reason about.',
    palette: palettes.ocean,
    cards: [
      {
        kind: 'image',
        size: 'large',
        title: 'Genix',
        description: 'Constraint-based procedural placement for Unity.',
        href: '/projects/genix',
        image: media.genix.office,
      },
      {
        kind: 'list',
        title: 'Genix',
        items: [
          { title: 'Case study', description: 'How the planner works', href: '/projects/genix' },
          { title: 'Source code', description: 'github.com/possiphil/Genix', href: 'https://github.com/possiphil/Genix' },
          { title: 'Thesis evidence', description: '500 evaluated placement runs', href: 'https://github.com/possiphil/Genix-Thesis-Evidence' },
        ],
      },
      { kind: 'icon', title: 'Orchestrator', description: 'Coming soon', glyph: 'nodes', palette: palettes.ocean },
      { kind: 'icon', title: 'Application Optimizer', description: 'Coming soon', glyph: 'spark', palette: palettes.berry },
      { kind: 'icon', title: 'Crawler', description: 'Coming soon', glyph: 'web', palette: palettes.lagoon },
      {
        kind: 'image',
        size: 'wide',
        title: 'Outdoor layouts',
        description: 'Paths, a bridge and props placed by Genix.',
        href: '/projects/genix',
        image: media.genix.outdoor,
      },
      { kind: 'text', title: 'GitHub', description: 'Everything else I work on.', href: contact.github },
    ],
  },
  {
    slug: 'experience',
    title: 'Experience',
    label: 'experience.',
    tagline: 'where i have worked.',
    intro: 'Roles, internships and teaching. Replace these placeholder cards in src/content/site.ts.',
    palette: palettes.ember,
    cards: [
      {
        kind: 'list',
        size: 'wide',
        title: 'Work',
        items: [
          { title: 'Your role · Company', description: 'Year – year · one line about the impact' },
          { title: 'Your role · Company', description: 'Year – year · one line about the impact' },
        ],
      },
      { kind: 'icon', title: 'Teaching', description: 'Tutorials & mentoring', glyph: 'book', palette: palettes.sunset },
      { kind: 'icon', title: 'Open source', description: 'Contributions', glyph: 'code', palette: palettes.ocean },
      {
        kind: 'image',
        size: 'large',
        title: 'Terrain study',
        description: 'Procedural landscapes during games engineering.',
        image: { image: terrain, alt: 'Isometric contour-line terrain study' },
      },
    ],
  },
  {
    slug: 'education',
    title: 'Education',
    label: 'education.',
    tagline: 'where i have learned.',
    intro: 'A master’s in software engineering after a bachelor’s in games engineering.',
    palette: palettes.lagoon,
    cards: [
      {
        kind: 'list',
        size: 'wide',
        title: 'Software Engineering, M.Sc.',
        items: [
          { title: 'Elite Graduate Program', description: 'LMU Munich · TU Munich · University of Augsburg' },
          { title: 'Ongoing', description: 'Developer tools, automation, architecture' },
        ],
      },
      { kind: 'icon', title: 'M.Sc.', description: 'Software Engineering', glyph: 'cap', palette: palettes.lagoon },
      { kind: 'icon', title: 'B.Sc.', description: 'Games Engineering', glyph: 'pad', palette: palettes.sunset },
      {
        kind: 'list',
        size: 'wide',
        title: 'Informatics: Games Engineering, B.Sc.',
        items: [
          { title: 'Technical University of Munich', description: 'Completed 2026' },
          { title: 'Bachelor’s thesis: Genix', description: 'Constraint-based procedural placement', href: '/projects/genix' },
        ],
      },
      {
        kind: 'image',
        size: 'large',
        title: 'Thesis',
        description: 'Reviewing placement plans in Unity.',
        href: '/projects/genix',
        image: media.genix.officePlan,
      },
    ],
  },
  {
    slug: 'skills',
    title: 'Skills',
    label: 'skills.',
    tagline: 'what i work with.',
    intro: 'Languages, tools and the areas I keep coming back to.',
    palette: palettes.berry,
    cards: [
      { kind: 'icon', title: 'Python', description: 'Automation & tooling', glyph: 'code', palette: palettes.ocean },
      { kind: 'icon', title: 'C#', description: 'Unity & editor tools', glyph: 'brackets', palette: palettes.berry },
      { kind: 'icon', title: 'SQL', description: 'PostgreSQL', glyph: 'db', palette: palettes.lagoon },
      {
        kind: 'list',
        title: 'Focus areas',
        items: [
          { title: 'Software architecture', description: 'Keeping systems changeable' },
          { title: 'Developer tools', description: 'Editors, pipelines, CLIs' },
          { title: 'Automation', description: 'Less manual work' },
        ],
      },
      { kind: 'icon', title: 'Unity', description: 'Engine & editor', glyph: 'cube', palette: palettes.sunset },
      {
        kind: 'text',
        size: 'large',
        title: 'Craft',
        description: 'Software that the next person can change.',
        palette: palettes.berry,
      },
      { kind: 'icon', title: 'PostgreSQL', description: 'Data modelling', glyph: 'db', palette: palettes.ember },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    label: 'contact.',
    tagline: 'let’s talk.',
    intro: 'Let’s talk about what you’re building.',
    palette: palettes.sunset,
    cards: [
      {
        kind: 'list',
        size: 'wide',
        title: 'Reach me',
        items: [
          { title: 'GitHub', description: 'github.com/possiphil', href: contact.github },
          ...(contact.email ? [{ title: 'Email', description: contact.email, href: `mailto:${contact.email}` }] : []),
          ...(contact.linkedin ? [{ title: 'LinkedIn', description: 'Connect with me', href: contact.linkedin }] : []),
        ],
      },
      { kind: 'icon', title: 'GitHub', description: '@possiphil', glyph: 'code', palette: palettes.ocean, href: contact.github },
      { kind: 'icon', title: 'About me', description: 'The long version', glyph: 'person', palette: palettes.sunset, href: '/about' },
    ],
  },
];

/** Small white link cards on the homepage, two links per card. */
export const homeLinks: { title: string; description: string; href: string }[][] = [
  [
    { title: 'About Me.', description: 'Who I am and what I build.', href: '/about' },
    { title: 'Genix.', description: 'My bachelor’s thesis.', href: '/projects/genix' },
  ],
  [
    { title: 'Collaborate', description: 'Let’s build something together.', href: '/contact' },
    { title: 'GitHub', description: 'Code and experiments.', href: contact.github },
  ],
];

/** Images that rotate in the large preview tile on the homepage. */
export const reel: { media: ProjectMedia; title: string; description: string; href: string }[] = [
  { media: media.genix.outdoor, title: 'Genix', description: 'Procedural placement in Unity.', href: '/projects/genix' },
  { media: { image: terrain, alt: 'Isometric terrain study' }, title: 'Terrain', description: 'A contour study.', href: '/experience' },
  { media: media.genix.office, title: 'Office layouts', description: 'Rules, not hand placement.', href: '/projects/genix' },
  { media: media.genix.officePlan, title: 'Planner', description: 'Groups that fit together.', href: '/projects/genix' },
];

/** Long-form "About" article. Paragraphs are plain strings; headings start a new section. */
export const about = {
  intro:
    'My name is Philipp Sanktjohanser. I study software engineering in Munich and I build tools that make complex work easier to reason about. This page is the longer version.',
  sections: [
    {
      heading: 'Hello',
      paragraphs: [
        'Hi. I’m Philipp, a software engineering master’s student with a background in games engineering. I’m interested in developer tools, automation, and the architectural choices that keep software understandable as it grows.',
        'I want the next person to be able to change what I build. That sentence shapes most of my decisions, from naming to the shape of an API.',
      ],
    },
    {
      heading: 'Games, then tools',
      paragraphs: [
        'Games engineering taught me how quickly a project turns into a pile of special cases. My bachelor’s thesis, Genix, is a Unity editor tool that lets designers describe placement rules instead of placing every object by hand.',
        'Building it moved my interest from the game itself to the tools around it: editors, previews, diagnostics and everything that helps people trust what software does.',
      ],
    },
    {
      heading: 'Now',
      paragraphs: [
        'I’m in the Elite Graduate Program in Software Engineering run by LMU Munich, TU Munich and the University of Augsburg. I’m looking for work on developer tooling and automation.',
        'If that sounds like something you’re building, I’d like to hear about it.',
      ],
    },
  ],
};

/** Case studies, rendered at /projects/<slug>. */
export interface Study {
  slug: string;
  title: string;
  summary: string;
  cover: ProjectMedia;
  facts: { label: string; value: string }[];
  links: { label: string; href: string }[];
  chapters: { heading: string; paragraphs: string[]; media?: ProjectMedia; code?: string }[];
  outcomes: string[];
}

export const studies: Study[] = [
  {
    slug: 'genix',
    title: 'Genix',
    summary:
      'A Unity editor tool that uses scene geometry and designer-authored rules to place objects in a level. Built as my bachelor’s thesis at TUM.',
    cover: media.genix.office,
    facts: [
      { label: 'Project', value: 'Bachelor’s thesis · TUM · 2026' },
      { label: 'Stack', value: 'C# · Unity' },
      { label: 'Focus', value: 'Constraint-based procedural placement' },
    ],
    links: [
      { label: 'Source code', href: 'https://github.com/possiphil/Genix' },
      { label: 'Designer manual', href: 'https://github.com/possiphil/Genix/blob/main/Packages/com.possiphil.genix/Documentation~/index.md' },
      { label: 'Thesis evidence', href: 'https://github.com/possiphil/Genix-Thesis-Evidence' },
    ],
    chapters: [
      {
        heading: 'Treating the scene as input',
        paragraphs: [
          'A shelf, a wall and an open floor offer different places to put an object. Genix lets a designer specify the surfaces a prefab can use and the relationships it needs to keep.',
          'A separate spatial system describes the valid areas and surfaces. Asset definitions and generation styles hold the placement rules, so a designer can reuse them across scenes.',
        ],
        media: media.genix.office,
      },
      {
        heading: 'Validating placements in stages',
        paragraphs: [
          'The planner samples candidate positions before trying compatible prefabs. It checks support tags early, then evaluates geometry such as spacing, clearance and contact.',
          'Some objects must be placed together. For a group such as a monitor, keyboard and mouse, the planner can discard an attempted group and try another anchor position when a required item has nowhere to fit.',
        ],
        code: [
          'for anchor in valid_anchor_candidates:',
          '  reserve_slots_for_required_objects()',
          '  if try_place_required_objects(anchor):',
          '    keep_group()',
          '    break',
          '  discard_branch()',
        ].join('\n'),
        media: media.genix.officePlan,
      },
      {
        heading: 'Reviewing the plan in Unity',
        paragraphs: [
          'Preview shows the proposed placements and reports rejections. Apply Preview instantiates the reviewed plan and integrates with Unity Undo.',
          'Fixed seeds let designers reproduce a layout from the same inputs. Genix also retains diagnostics for runs that place only part of the requested set, so a designer can see which constraints limited the result.',
        ],
        media: media.genix.outdoor,
      },
    ],
    outcomes: [
      'Delivered an editor workflow for previewing, applying and saving prefab layouts in Unity.',
      'Evaluated 500 placement runs across isolated rules and integrated scenes, including deliberately overloaded configurations that returned partial layouts.',
    ],
  },
];

/** Drawer navigation, grouped like a table of contents. */
export const navigation = [
  {
    heading: 'Work & CV',
    links: categories.filter((c) => c.slug !== 'contact').map((c) => ({ title: c.slug, description: c.tagline, href: `/${c.slug}` })),
  },
  {
    heading: 'About me',
    links: [
      { title: 'about', description: 'the longer version.', href: '/about' },
      { title: 'genix', description: 'my bachelor’s thesis.', href: '/projects/genix' },
    ],
  },
];

export type { ImageMetadata };
