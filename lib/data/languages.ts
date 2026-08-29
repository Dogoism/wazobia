import type { Language, LanguageCode, LanguageVariant } from "@/lib/types";

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
  { code: "yo", name: "Yorùbá", nativeName: "Èdè Yorùbá" },
];

/** Display order for the comparison screen. */
export const LANGUAGE_ORDER: LanguageCode[] = ["en", "ha", "ig", "yo"];

export const LANGUAGE_VARIANTS: LanguageVariant[] = [
  // English has a single reference variety for now (no selector shown).
  { id: "en-standard", languageCode: "en", name: "English", isStandard: true },

  // Hausa
  { id: "ha-standard", languageCode: "ha", name: "Standard Hausa", isStandard: true },
  { id: "ha-kano", languageCode: "ha", name: "Kano colloquial", isStandard: false, regionNote: "Kano" },
  { id: "ha-sokoto", languageCode: "ha", name: "Sokoto", isStandard: false, regionNote: "Sokoto" },
  { id: "ha-ghana", languageCode: "ha", name: "Ghana Hausa (Gaananci)", isStandard: false, regionNote: "Ghana" },

  // Igbo
  { id: "ig-standard", languageCode: "ig", name: "Standard Igbo", isStandard: true },
  { id: "ig-enuani", languageCode: "ig", name: "Enuani", isStandard: false, regionNote: "Delta State" },
  { id: "ig-ika", languageCode: "ig", name: "Ika", isStandard: false, regionNote: "Delta/Edo" },
  { id: "ig-ukwuani", languageCode: "ig", name: "Ukwuani", isStandard: false, regionNote: "Delta State" },
  { id: "ig-onitsha", languageCode: "ig", name: "Onitsha", isStandard: false, regionNote: "Anambra State" },

  // Yorùbá
  { id: "yo-standard", languageCode: "yo", name: "Standard Yorùbá", isStandard: true },
  { id: "yo-oyo", languageCode: "yo", name: "Ọ̀yọ́", isStandard: false, regionNote: "Ọ̀yọ́ State" },
  { id: "yo-ijebu", languageCode: "yo", name: "Ìjẹ̀bú", isStandard: false, regionNote: "Ogun State" },
  { id: "yo-ekiti", languageCode: "yo", name: "Èkìtì", isStandard: false, regionNote: "Èkìtì State" },
  { id: "yo-ondo", languageCode: "yo", name: "Ondo", isStandard: false, regionNote: "Ondo State" },
];

export function getLanguage(code: LanguageCode): Language {
  const language = LANGUAGES.find((l) => l.code === code);
  if (!language) throw new Error(`Unknown language code: ${code}`);
  return language;
}

export function variantsFor(code: LanguageCode): LanguageVariant[] {
  return LANGUAGE_VARIANTS.filter((v) => v.languageCode === code);
}

export function standardVariantFor(code: LanguageCode): LanguageVariant {
  const variant = LANGUAGE_VARIANTS.find(
    (v) => v.languageCode === code && v.isStandard,
  );
  if (!variant) throw new Error(`No standard variant for language: ${code}`);
  return variant;
}

export function getVariant(id: string): LanguageVariant | undefined {
  return LANGUAGE_VARIANTS.find((v) => v.id === id);
}
