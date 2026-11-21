import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';
import { dictionaries } from '@/content/site';

const t = dictionaries.en;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: '/', languages: { en: '/', de: '/de' } },
  openGraph: { title: t.meta.title, description: t.meta.description, locale: 'en_US' },
};

export default function Page() {
  return <HomePage locale="en" />;
}
