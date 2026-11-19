interface Project {
  id: string;
  name: string;
  title: string;
  context: string;
  description: string;
  details: { label: string; value: string }[];
  url?: string;
}

export const portfolio = {
  firstName: 'Philipp',
  lastName: 'Sanktjohanser',
  initials: 'PS',
  role: 'Software engineering student',
  introduction: 'I’m interested in developer tools, automation, and building software that’s easy to maintain.',
  description: 'Philipp Sanktjohanser is a software engineering student interested in developer tools, automation, and software architecture. Explore his work and education.',
  github: { handle: 'possiphil', url: 'https://github.com/possiphil' },
  about: {
    heading: 'I like building tools people can rely on.',
    paragraphs: [
      'I’m a master’s student in software engineering with a background in games engineering. I’m drawn to technically challenging problems where a good tool can make someone’s work easier.',
      'I’m interested in automating repetitive work and in how architectural choices can keep software understandable as it grows.',
    ],
  },
  education: [
    {
      degree: 'M.Sc. Software Engineering',
      institutions: 'LMU Munich, Technical University of Munich (TUM), and University of Augsburg',
      program: 'Elite Graduate Program',
      date: 'Since October 2026',
      dateTime: '2026-10',
    },
    {
      degree: 'B.Sc. Informatics: Games Engineering',
      institutions: 'Technical University of Munich (TUM)',
      date: 'Completed 2026',
      dateTime: '2026',
    },
  ],
  technicalAreas: [
    { label: 'Languages', value: 'Python, C#, SQL' },
    { label: 'Tools and platforms', value: 'Unity, PostgreSQL' },
    { label: 'Focus areas', value: 'Software engineering and architecture, developer tools, automation' },
  ],
  contact: 'Explore my public projects and code.',
};

export const fullName = `${portfolio.firstName} ${portfolio.lastName}`;

export const projects: Project[] = [
  {
    id: 'genix',
    name: 'Genix',
    title: 'A Designer-Focused Tool for Context-Aware Procedural Content Generation',
    context: 'Bachelor’s thesis · TUM · 2026',
    description: 'I built Genix as a Unity editor tool for my bachelor’s thesis. I explored how the context of a designer’s work could inform what the tool generates and how to make generation fit into the designer’s workflow.',
    details: [
      { label: 'Technology', value: 'C# and Unity' },
      { label: 'Focus', value: 'Designer usability and context-aware generation' },
    ],
  },
];
