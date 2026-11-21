/**
 * ─────────────────────────────────────────────────────────────
 *  ALL PERSONAL CONTENT LIVES HERE.
 *  Edit this file to personalise the site — components only read from it.
 *  Values marked `TODO` are placeholders that still need your input.
 * ─────────────────────────────────────────────────────────────
 */

export type Locale = 'en' | 'de';
export const locales: Locale[] = ['en', 'de'];

/* ─── Language-independent data ─────────────────────────────── */

export const profile = {
  firstName: 'Philipp',
  lastName: 'Sanktjohanser',
  /** Big hero monogram. The trailing accent dot is added automatically. */
  monogram: 'PS',
  /** TODO: confirm a working address before going live. */
  email: 'hello@sanktjohanser.dev',
  /** TODO: drop the PDF into /public with this name. */
  resume: '/Philipp-Sanktjohanser-CV.pdf',
  siteUrl: 'https://sanktjohanser.dev',
  /**
   * Hero background. Dark images work best.
   * - layout 'portrait': image sits on the right and fades into the page (good for a photo of you).
   * - layout 'wide': full-bleed scene with a scrim on the left (good for a desk / workspace photo).
   */
  heroImage: '/images/portrait.webp',
  heroImagePosition: '50% 22%',
  heroLayout: 'portrait' as 'portrait' | 'wide',
  portrait: '/images/portrait.webp',
};

export type SocialKey = 'github' | 'linkedin' | 'x' | 'instagram' | 'youtube';

/** Only entries with a URL are rendered. */
export const socials: { key: SocialKey; label: string; href?: string }[] = [
  { key: 'github', label: 'GitHub', href: 'https://github.com/possiphil' },
  { key: 'linkedin', label: 'LinkedIn', href: undefined /* TODO: 'https://www.linkedin.com/in/…' */ },
];

/**
 * Tech marquee under the hero. `icon` is a simple-icons slug (https://simpleicons.org),
 * `brand` is the hover colour (omit to use the foreground colour).
 */
export const marquee: { label: string; icon: string; brand?: string }[] = [
  { label: 'Python', icon: 'python', brand: '#3776AB' },
  { label: 'C#', icon: 'dotnet', brand: '#9B6BDF' },
  { label: 'Unity', icon: 'unity' },
  { label: 'PostgreSQL', icon: 'postgresql', brand: '#4169E1' },
  { label: 'SQL', icon: 'sqlite', brand: '#4FA3D1' },
  { label: 'TypeScript', icon: 'typescript', brand: '#3178C6' },
  { label: 'Git', icon: 'git', brand: '#F03C2E' },
  { label: 'Docker', icon: 'docker', brand: '#2496ED' },
  { label: 'GitHub Actions', icon: 'githubactions', brand: '#2088FF' },
  { label: 'Linux', icon: 'linux', brand: '#FCC624' },
  { label: 'Rider', icon: 'rider' },
  { label: 'Blender', icon: 'blender', brand: '#E87D0D' },
];

/** Rendered as a TypeScript object in the "Skills" code window. Keys stay in English on purpose. */
export const stack: Record<string, string[]> = {
  languages: ['Python', 'C#', 'SQL', 'TypeScript'],
  engines: ['Unity', 'Unity Editor tooling'],
  data: ['PostgreSQL'],
  tooling: ['Git', 'GitHub', 'Docker', 'CI/CD'],
  focus: ['Software architecture', 'Developer tools', 'Automation'],
};

export type ProjectStatus = 'live' | 'done' | 'wip';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  /** Cover image or video. Without one, an abstract placeholder is drawn. */
  image?: string;
  imagePosition?: string;
  video?: string;
  href?: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: 'genix',
    name: 'Genix',
    status: 'done',
    image: '/images/office-overview.webp',
    href: 'https://github.com/possiphil/Genix',
    tags: ['C#', 'Unity', 'Editor tooling', 'Procedural placement', 'Constraint solving', 'Undo integration'],
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    status: 'wip',
    tags: ['Python', 'Automation'], // TODO
  },
  {
    id: 'application-optimizer',
    name: 'Application Optimizer',
    status: 'wip',
    tags: ['Python'], // TODO
  },
  {
    id: 'crawler',
    name: 'Crawler',
    status: 'wip',
    tags: ['Python', 'PostgreSQL'], // TODO
  },
];

/* ─── Translated copy ───────────────────────────────────────── */

type JourneyKind = 'education' | 'work' | 'project';

export interface Dictionary {
  meta: { title: string; description: string };
  nav: { projects: string; journey: string; stack: string; about: string; contact: string; home: string; cv: string; menu: string; skip: string };
  hero: { eyebrow: string; role: string; lead: string; ctaPrimary: string; ctaSecondary: string };
  about: {
    title: string;
    lead: string;
    facts: { icon: 'map' | 'graduation' | 'languages'; label: string }[];
    /** Wrap words in **double asterisks** to highlight them. */
    paragraphs: string[];
    pillars: { icon: 'wrench' | 'layers' | 'gamepad'; title: string; text: string }[];
  };
  skills: { title: string; lead: string; comment: string };
  projects: {
    eyebrow: string;
    title: string;
    lead: string;
    all: string;
    status: Record<ProjectStatus, string>;
    open: string;
    items: Record<string, { subtitle: string; summary: string }>;
  };
  journey: {
    title: string;
    lead: string;
    kinds: Record<JourneyKind, string>;
    items: { kind: JourneyKind; title: string; org: string; note?: string; date: string; duration?: string; text: string }[];
    cta: string;
  };
  interests: { title: string; items: { icon: 'code' | 'cpu' | 'gamepad' | 'bot' | 'blocks' | 'mountain'; label: string }[] };
  faq: { title: string; lead: string; items: { q: string; a: string }[] };
  contact: {
    eyebrow: string;
    lead: string;
    download: string;
    formTitle: string;
    formLead: string;
    name: string;
    email: string;
    message: string;
    send: string;
    privacy: string;
    newTab: string;
  };
  footer: { tagline: string; status: string; navigation: string; contact: string; rights: string };
  floating: { short: string; long: string };
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    meta: {
      title: 'Philipp Sanktjohanser — Software Engineer',
      description:
        'Philipp Sanktjohanser is a software engineering student with a background in games engineering, building developer tools and automation.',
    },
    nav: {
      projects: 'Projects',
      journey: 'Journey',
      stack: 'Stack',
      about: 'About',
      contact: 'Contact',
      home: 'Home',
      cv: 'CV',
      menu: 'Menu',
      skip: 'Skip to content',
    },
    hero: {
      eyebrow: 'M.Sc. Software Engineering · Elite Graduate Program',
      role: 'Software Engineer',
      lead: 'I build tools that make complex work easier to reason about.',
      ctaPrimary: 'See my projects',
      ctaSecondary: 'Get in touch',
    },
    about: {
      title: 'About',
      lead: 'From games engineering at TUM to the Elite Graduate Program in Software Engineering.',
      facts: [
        { icon: 'map', label: 'Bavaria, Germany' }, // TODO
        { icon: 'graduation', label: 'M.Sc. student' },
        { icon: 'languages', label: 'German · English' }, // TODO
      ],
      paragraphs: [
        'I’m a **software engineering** master’s student in the **Elite Graduate Program** of LMU Munich, TUM and the University of Augsburg, with a bachelor’s degree in **Games Engineering** from **TUM**.',
        'I’m interested in **developer tools**, **automation**, and the architectural choices that keep software understandable as it grows. For my bachelor’s thesis I built **Genix**, a Unity editor tool that places objects in a level from scene geometry and designer-authored rules. I want the next person to be able to change what I build.',
      ],
      pillars: [
        { icon: 'wrench', title: 'Developer tools', text: 'Editors, generators, workflows' },
        { icon: 'layers', title: 'Architecture', text: 'Software that stays changeable' },
        { icon: 'gamepad', title: 'Games background', text: 'B.Sc. Games Engineering, TUM' },
      ],
    },
    skills: {
      title: 'Skills',
      lead: 'What I reach for: Python and C# for tools and automation, Unity for interactive work, PostgreSQL for data.',
      comment: '// my technical stack',
    },
    projects: {
      eyebrow: 'Selection',
      title: 'Projects',
      lead: 'Concrete work, from procedural level tooling to automation pipelines.',
      all: 'All projects on GitHub',
      status: { live: 'Live', done: 'Completed', wip: 'In progress' },
      open: 'Open project',
      items: {
        genix: {
          subtitle: 'Unity editor tool · Bachelor’s thesis',
          summary:
            'Uses scene geometry and designer-authored rules to place objects in a level, with preview, apply and Undo integration.',
        },
        orchestrator: { subtitle: 'Description coming soon', summary: 'TODO: add a short description.' },
        'application-optimizer': { subtitle: 'Description coming soon', summary: 'TODO: add a short description.' },
        crawler: { subtitle: 'Description coming soon', summary: 'TODO: add a short description.' },
      },
    },
    journey: {
      title: 'Journey',
      lead: 'From a games engineering degree at TUM to a master’s in software engineering.',
      kinds: { education: 'Degree', work: 'Work', project: 'Thesis' },
      items: [
        {
          kind: 'education',
          title: 'Software Engineering, M.Sc.',
          org: 'LMU Munich · TUM · University of Augsburg',
          note: 'Elite Graduate Program',
          date: 'Since 2026',
          duration: 'Ongoing',
          text: 'An interuniversity master’s programme in the Elite Network of Bavaria focusing on software architecture, verification and engineering of large systems.',
        },
        {
          kind: 'project',
          title: 'Genix — constraint-based procedural placement',
          org: 'Technical University of Munich',
          note: 'Bachelor’s thesis',
          date: '2026',
          text: 'A Unity editor tool that validates placements in stages, supports grouped objects and reproducible seeds, and was evaluated over 500 placement runs.',
        },
        {
          kind: 'education',
          title: 'Informatics: Games Engineering, B.Sc.',
          org: 'Technical University of Munich',
          date: '2026',
          duration: 'Completed',
          text: 'Computer science with a focus on interactive real-time systems, graphics and game development.',
        },
      ],
      cta: 'The full journey, as a CV',
    },
    interests: {
      title: 'Interests',
      items: [
        { icon: 'code', label: 'Developer tools' },
        { icon: 'blocks', label: 'Software architecture' },
        { icon: 'bot', label: 'Automation' },
        { icon: 'gamepad', label: 'Game development' },
        { icon: 'cpu', label: 'Procedural generation' },
      ],
    },
    faq: {
      title: 'Frequently asked',
      lead: 'Short answers, without having to scroll through the whole page.',
      items: [
        {
          q: 'What am I studying?',
          a: 'Software Engineering (M.Sc.) in the Elite Graduate Program run jointly by LMU Munich, TUM and the University of Augsburg.',
        },
        {
          q: 'Which technologies do I work with?',
          a: 'Mostly Python and C#, Unity for interactive and tooling work, and PostgreSQL for data. Git, Docker and CI around it.',
        },
        {
          q: 'What was my bachelor’s thesis about?',
          a: 'Genix: a Unity editor tool that uses scene geometry and designer rules to place prefabs, with preview, apply and diagnostics for partial results.',
        },
        {
          q: 'What kind of work am I looking for?',
          a: 'TODO: describe the roles, internships or working-student positions you are interested in.',
        },
        {
          q: 'How can you reach me?',
          a: 'Via the form at the bottom of this page, by email, or on GitHub.',
        },
      ],
    },
    contact: {
      eyebrow: 'Contact',
      lead: 'A question about a project or my background? Write to me:',
      download: 'Download my CV',
      formTitle: 'Get in touch',
      formLead: 'I usually reply within a day or two.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send message',
      privacy: 'The form opens your email app with the message pre-filled — nothing is stored on this site.',
      newTab: '(opens in a new tab)',
    },
    footer: {
      tagline: 'Software engineering student building developer tools and automation.',
      status: 'Open to opportunities',
      navigation: 'Navigation',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },
    floating: { short: 'Contact', long: 'Get in touch' },
  },

  de: {
    meta: {
      title: 'Philipp Sanktjohanser — Software Engineer',
      description:
        'Philipp Sanktjohanser studiert Software Engineering, kommt aus dem Games Engineering und baut Entwicklerwerkzeuge und Automatisierung.',
    },
    nav: {
      projects: 'Projekte',
      journey: 'Werdegang',
      stack: 'Stack',
      about: 'Über mich',
      contact: 'Kontakt',
      home: 'Start',
      cv: 'CV',
      menu: 'Menü',
      skip: 'Zum Inhalt springen',
    },
    hero: {
      eyebrow: 'M.Sc. Software Engineering · Elitestudiengang',
      role: 'Software Engineer',
      lead: 'Ich baue Werkzeuge, die komplexe Arbeit leichter nachvollziehbar machen.',
      ctaPrimary: 'Meine Projekte',
      ctaSecondary: 'Kontakt aufnehmen',
    },
    about: {
      title: 'Über mich',
      lead: 'Vom Games Engineering an der TUM zum Elitestudiengang Software Engineering.',
      facts: [
        { icon: 'map', label: 'Bayern, Deutschland' }, // TODO
        { icon: 'graduation', label: 'M.Sc.-Student' },
        { icon: 'languages', label: 'Deutsch · Englisch' }, // TODO
      ],
      paragraphs: [
        'Ich studiere **Software Engineering** im **Elitestudiengang** von LMU München, TUM und Universität Augsburg und habe meinen Bachelor in **Games Engineering** an der **TUM** abgeschlossen.',
        'Mich interessieren **Entwicklerwerkzeuge**, **Automatisierung** und die Architekturentscheidungen, die Software verständlich halten, während sie wächst. In meiner Bachelorarbeit habe ich **Genix** gebaut, ein Unity-Editor-Tool, das Objekte anhand von Szenengeometrie und Designer-Regeln platziert. Die nächste Person soll ändern können, was ich baue.',
      ],
      pillars: [
        { icon: 'wrench', title: 'Entwicklerwerkzeuge', text: 'Editoren, Generatoren, Workflows' },
        { icon: 'layers', title: 'Architektur', text: 'Software, die änderbar bleibt' },
        { icon: 'gamepad', title: 'Games-Hintergrund', text: 'B.Sc. Games Engineering, TUM' },
      ],
    },
    skills: {
      title: 'Skills',
      lead: 'Womit ich arbeite: Python und C# für Tools und Automatisierung, Unity für Interaktives, PostgreSQL für Daten.',
      comment: '// mein technischer Stack',
    },
    projects: {
      eyebrow: 'Auswahl',
      title: 'Projekte',
      lead: 'Konkrete Arbeiten, von prozeduralen Level-Tools bis zu Automatisierungs-Pipelines.',
      all: 'Alle Projekte auf GitHub',
      status: { live: 'Live', done: 'Abgeschlossen', wip: 'In Arbeit' },
      open: 'Projekt öffnen',
      items: {
        genix: {
          subtitle: 'Unity-Editor-Tool · Bachelorarbeit',
          summary:
            'Platziert Objekte anhand von Szenengeometrie und Designer-Regeln, mit Vorschau, Übernehmen und Undo-Integration.',
        },
        orchestrator: { subtitle: 'Beschreibung folgt', summary: 'TODO: kurze Beschreibung ergänzen.' },
        'application-optimizer': { subtitle: 'Beschreibung folgt', summary: 'TODO: kurze Beschreibung ergänzen.' },
        crawler: { subtitle: 'Beschreibung folgt', summary: 'TODO: kurze Beschreibung ergänzen.' },
      },
    },
    journey: {
      title: 'Werdegang',
      lead: 'Vom Games-Engineering-Studium an der TUM zum Master in Software Engineering.',
      kinds: { education: 'Studium', work: 'Arbeit', project: 'Abschlussarbeit' },
      items: [
        {
          kind: 'education',
          title: 'Software Engineering, M.Sc.',
          org: 'LMU München · TUM · Universität Augsburg',
          note: 'Elitestudiengang',
          date: 'Seit 2026',
          duration: 'Laufend',
          text: 'Ein universitätsübergreifender Master im Elitenetzwerk Bayern mit Fokus auf Softwarearchitektur, Verifikation und das Engineering großer Systeme.',
        },
        {
          kind: 'project',
          title: 'Genix — regelbasierte prozedurale Platzierung',
          org: 'Technische Universität München',
          note: 'Bachelorarbeit',
          date: '2026',
          text: 'Ein Unity-Editor-Tool, das Platzierungen stufenweise validiert, Objektgruppen und reproduzierbare Seeds unterstützt und über 500 Läufe evaluiert wurde.',
        },
        {
          kind: 'education',
          title: 'Informatik: Games Engineering, B.Sc.',
          org: 'Technische Universität München',
          date: '2026',
          duration: 'Abgeschlossen',
          text: 'Informatik mit Schwerpunkt auf interaktiven Echtzeitsystemen, Grafik und Spieleentwicklung.',
        },
      ],
      cta: 'Der komplette Werdegang als CV',
    },
    interests: {
      title: 'Interessen',
      items: [
        { icon: 'code', label: 'Entwicklerwerkzeuge' },
        { icon: 'blocks', label: 'Softwarearchitektur' },
        { icon: 'bot', label: 'Automatisierung' },
        { icon: 'gamepad', label: 'Spieleentwicklung' },
        { icon: 'cpu', label: 'Prozedurale Generierung' },
      ],
    },
    faq: {
      title: 'Häufige Fragen',
      lead: 'Kurze Antworten, ohne die ganze Seite durchsuchen zu müssen.',
      items: [
        {
          q: 'Was studiere ich?',
          a: 'Software Engineering (M.Sc.) im Elitestudiengang, gemeinsam getragen von LMU München, TUM und Universität Augsburg.',
        },
        {
          q: 'Mit welchen Technologien arbeite ich?',
          a: 'Hauptsächlich Python und C#, Unity für Interaktives und Tooling und PostgreSQL für Daten. Dazu Git, Docker und CI.',
        },
        {
          q: 'Worum ging es in meiner Bachelorarbeit?',
          a: 'Genix: ein Unity-Editor-Tool, das Prefabs anhand von Szenengeometrie und Designer-Regeln platziert, mit Vorschau, Übernehmen und Diagnosen für Teilergebnisse.',
        },
        {
          q: 'Wonach suche ich?',
          a: 'TODO: Rollen, Praktika oder Werkstudentenstellen beschreiben, die dich interessieren.',
        },
        {
          q: 'Wie erreicht man mich?',
          a: 'Über das Formular unten auf der Seite, per E-Mail oder auf GitHub.',
        },
      ],
    },
    contact: {
      eyebrow: 'Kontakt',
      lead: 'Eine Frage zu einem Projekt oder meinem Werdegang? Schreib mir:',
      download: 'CV herunterladen',
      formTitle: 'Schreib mir',
      formLead: 'Ich antworte meistens innerhalb von ein, zwei Tagen.',
      name: 'Name',
      email: 'E-Mail',
      message: 'Nachricht',
      send: 'Nachricht senden',
      privacy: 'Das Formular öffnet dein Mailprogramm mit vorausgefüllter Nachricht — auf dieser Seite wird nichts gespeichert.',
      newTab: '(öffnet in neuem Tab)',
    },
    footer: {
      tagline: 'Software-Engineering-Student, der Entwicklerwerkzeuge und Automatisierung baut.',
      status: 'Offen für Neues',
      navigation: 'Navigation',
      contact: 'Kontakt',
      rights: 'Alle Rechte vorbehalten.',
    },
    floating: { short: 'Kontakt', long: 'Schreib mir' },
  },
};
