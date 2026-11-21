import type { ImageMetadata } from 'astro';
import officeOverview from '../assets/genix/office-overview.webp';
import officePlan from '../assets/genix/office-plan.webp';
import outdoorLayout from '../assets/genix/outdoor-layout.webp';
import portrait from '../assets/portrait.webp';

export interface ProjectMedia {
  image: ImageMetadata;
  alt: string;
  kind?: 'illustration' | 'render';
  position?: string;
  video?: string;
}

const outdoorCapture: ProjectMedia = {
  image: outdoorLayout,
  alt: 'Unity capture of an outdoor layout with paths, a bridge, and props placed by Genix',
  kind: 'render',
  position: '57% 51%',
};

export const media = {
  portrait: { image: portrait, alt: 'Portrait of Philipp Sanktjohanser' },
  genix: {
    cover: outdoorCapture,
    office: {
      image: officeOverview,
      alt: 'Perspective Unity capture of an office layout with desks, shelves, and lights placed by Genix',
    },
    officePlan: {
      image: officePlan,
      alt: 'Top-down Unity capture of the same office layout, showing desk groups and the space between them',
    },
    outdoor: outdoorCapture,
  },
};

export const contact: {
  github: string;
  linkedin?: string;
  email?: string;
  resume?: string;
} = {
  github: 'https://github.com/possiphil',
};
