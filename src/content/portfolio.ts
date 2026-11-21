import { media, type ProjectMedia } from './media';

export interface Chapter {
  id: string;
  label: string;
  title: string;
  intro: string;
  detail: string;
  pseudocode?: string;
  side: 'left' | 'right';
  media?: ProjectMedia;
  pendingMedia?: string;
}

interface CaseStudy {
  summary: string;
  facts: { label: string; value: string }[];
  chapters: Chapter[];
  outcomes: string[];
  links?: { label: string; href: string }[];
}

export interface Project {
  id: string;
  name: string;
  slot?: 'featured' | 'side' | 'middle' | 'last';
  category?: string;
  cover?: ProjectMedia;
  study?: CaseStudy;
}

export const portfolio = {
  firstName: 'Philipp',
  lastName: 'Sanktjohanser',
  role: 'Software engineering student',
  introduction: 'I build tools that make complex work easier to reason about.',
  description: 'Philipp Sanktjohanser is a software engineering student with a background in games engineering. Explore his work in developer tools and automation.',
  about: {
    statement: 'I want the next person to be able to change what I build.',
    emphasis: 'change what I build.',
    paragraph: 'I’m a software engineering master’s student with a background in games engineering. I’m interested in developer tools, automation, and the architectural choices that keep software understandable as it grows.',
  },
  education: [
    {
      degree: 'Software Engineering, M.Sc.',
      institutions: 'LMU Munich · Technical University of Munich · University of Augsburg',
      program: 'Elite Graduate Program',
      date: 'Ongoing',
    },
    {
      degree: 'Informatics: Games Engineering, B.Sc.',
      institutions: 'Technical University of Munich',
      date: 'Completed 2026',
      dateTime: '2026',
    },
  ],
  technicalAreas: [
    { label: 'Languages', items: ['Python', 'C#', 'SQL'] },
    { label: 'Tools & platforms', items: ['Unity', 'PostgreSQL'] },
    { label: 'Focus areas', items: ['Software architecture', 'Developer tools', 'Automation'] },
  ],
  contact: 'Let’s talk about what you’re building.',
};

export const fullName = `${portfolio.firstName} ${portfolio.lastName}`;

export const projects: Project[] = [
  {
    id: 'genix',
    name: 'Genix',
    slot: 'featured',
    category: 'Unity editor tool · Bachelor’s thesis',
    cover: media.genix.cover,
    study: {
      summary: 'A Unity editor tool that uses scene geometry and designer-authored rules to place objects in a level. Built as my bachelor’s thesis at TUM.',
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
          id: 'question',
          label: 'Scene and rules',
          title: 'Treating the scene as input',
          intro: 'A shelf, a wall and an open floor offer different places to put an object. Genix lets a designer specify the surfaces a prefab can use and the relationships it needs to keep.',
          detail: 'A separate spatial system describes the valid areas and surfaces. Asset definitions and generation styles hold the placement rules, so a designer can reuse them across scenes.',
          side: 'left',
          media: media.genix.office,
        },
        {
          id: 'approach',
          label: 'Placement planner',
          title: 'Validating placements in stages',
          intro: 'The planner samples candidate positions before trying compatible prefabs. It checks support tags early, then evaluates geometry such as spacing, clearance and contact.',
          detail: 'Some objects must be placed together. For a group such as a monitor, keyboard and mouse, the planner can discard an attempted group and try another anchor position when a required item has nowhere to fit.',
          pseudocode: [
            'for anchor in valid_anchor_candidates:',
            '  reserve_slots_for_required_objects()',
            '  if try_place_required_objects(anchor):',
            '    keep_group()',
            '    break',
            '  discard_branch()',
          ].join('\n'),
          side: 'right',
          media: media.genix.officePlan,
        },
        {
          id: 'result',
          label: 'Preview and apply',
          title: 'Reviewing the plan in Unity',
          intro: 'Preview shows the proposed placements and reports rejections. Apply Preview instantiates the reviewed plan and integrates with Unity Undo.',
          detail: 'Fixed seeds let designers reproduce a layout from the same inputs. Genix also retains diagnostics for runs that place only part of the requested set, so a designer can see which constraints limited the result.',
          side: 'left',
          media: media.genix.outdoor,
        },
      ],
      outcomes: [
        'Delivered an editor workflow for previewing, applying and saving prefab layouts in Unity.',
        'Evaluated 500 placement runs across isolated rules and integrated scenes, including deliberately overloaded configurations that returned partial layouts.',
      ],
    },
  },
  { id: 'orchestrator', name: 'Orchestrator', slot: 'side' },
  { id: 'application-optimizer', name: 'Application Optimizer', slot: 'middle' },
  { id: 'crawler', name: 'Crawler', slot: 'last' },
];

export type CaseStudyProject = Project & { study: CaseStudy };
export const caseStudies = projects.filter((project): project is CaseStudyProject => Boolean(project.study));
