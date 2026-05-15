// src/utils/getTranslations.ts
export async function getTranslations(lang: string) {
  const { default: translations } = await import(`../i18n/${lang}.ts`);
  return translations;
}
