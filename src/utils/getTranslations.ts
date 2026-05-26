// src/utils/getTranslations.ts
import { isSupportedLang, type SupportedLang } from '@/lib/i18n/lang';

export async function getTranslations(lang: string) {
  const safe: SupportedLang = isSupportedLang(lang) ? lang : 'en';
  const { default: translations } = await import(`../i18n/${safe}.ts`);
  return translations;
}
