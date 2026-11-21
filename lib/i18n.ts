import { dictionaries, type Locale } from '@/content/site';

export const getDictionary = (locale: Locale) => dictionaries[locale];

/** Path of the home page for a locale. English lives at `/`, German at `/de`. */
export const homePath = (locale: Locale) => (locale === 'en' ? '/' : `/${locale}`);
