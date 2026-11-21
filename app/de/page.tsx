import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';
import { dictionaries } from '@/content/site';

const t = dictionaries.de;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: '/de', languages: { en: '/', de: '/de' } },
  openGraph: { title: t.meta.title, description: t.meta.description, locale: 'de_DE' },
};

export default function Page() {
  return <HomePage locale="de" />;
}
