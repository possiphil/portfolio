import { projects, socials, type Dictionary } from '@/content/site';
import { ProjectsTrack } from './ProjectsTrack';

export function Projects({ t }: { t: Dictionary }) {
  const github = socials.find((s) => s.key === 'github')?.href;
  return (
    <ProjectsTrack
      projects={projects}
      copy={t.projects}
      allHref={github}
    />
  );
}
