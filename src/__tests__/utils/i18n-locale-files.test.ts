interface LocaleMessage {
  message: string;
}

type LocaleMessages = Record<string, LocaleMessage>;

const localeFiles: Record<string, LocaleMessages> = {
  de: require('public/_locales/de/messages.json'),
  en: require('public/_locales/en/messages.json'),
  es: require('public/_locales/es/messages.json'),
  fr: require('public/_locales/fr/messages.json'),
  id: require('public/_locales/id/messages.json'),
  pt: require('public/_locales/pt/messages.json'),
  'zh-CN': require('public/_locales/zh-CN/messages.json'),
  'zh-TW': require('public/_locales/zh-TW/messages.json'),
};

const getPlaceholders = (message: string) =>
  Array.from(
    new Set(
      message.match(/\$[A-Z0-9_]+\$|\$\d+|\{[a-zA-Z0-9_]+\}/g) ?? [],
    ),
  ).sort();

const getMaxNonChineseMessageLength = (englishMessage: string) =>
  Math.max(englishMessage.length + 24, Math.ceil(englishMessage.length * 1.7));

describe('i18n locale files', () => {
  it('keeps every locale aligned with English message keys', () => {
    const englishKeys = Object.keys(localeFiles.en).sort();

    for (const messages of Object.values(localeFiles)) {
      expect(Object.keys(messages).sort()).toEqual(englishKeys);
    }
  });

  it('keeps placeholders aligned with English messages', () => {
    const englishMessages = localeFiles.en;

    for (const [locale, messages] of Object.entries(localeFiles)) {
      const invalidPlaceholders = Object.entries(englishMessages).flatMap(
        ([key, englishMessage]) => {
          const expectedPlaceholders = getPlaceholders(englishMessage.message);
          const actualPlaceholders = getPlaceholders(messages[key].message);

          return expectedPlaceholders.join(',') === actualPlaceholders.join(',')
            ? []
            : [`${locale}:${key}`];
        },
      );

      expect(invalidPlaceholders).toEqual([]);
    }
  });

  it('keeps non-Chinese translations close to English message length', () => {
    const englishMessages = localeFiles.en;

    for (const [locale, messages] of Object.entries(localeFiles)) {
      if (locale === 'en' || locale.startsWith('zh')) continue;

      const oversizedMessages = Object.entries(englishMessages).flatMap(
        ([key, englishMessage]) => {
          const translatedMessage = messages[key].message;
          const englishText = englishMessage.message;

          if (!englishText || translatedMessage === englishText) return [];

          const maxLength = getMaxNonChineseMessageLength(englishText);

          return translatedMessage.length <= maxLength
            ? []
            : [
                `${locale}:${key} (${translatedMessage.length}/${maxLength})`,
              ];
        },
      );

      expect(oversizedMessages).toEqual([]);
    }
  });
});
