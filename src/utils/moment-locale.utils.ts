import moment from 'moment';
import 'moment/locale/de';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/id';
import 'moment/locale/pt';
import 'moment/locale/zh-cn';
import 'moment/locale/zh-tw';

const DEFAULT_MOMENT_LOCALE = 'en';

const getMomentLocale = (language?: string): string => {
  if (language === 'zh-CN') {
    return 'zh-cn';
  }
  if (language === 'zh-TW') {
    return 'zh-tw';
  }
  if (
    language === 'de' ||
    language === 'en' ||
    language === 'es' ||
    language === 'fr' ||
    language === 'id' ||
    language === 'pt'
  ) {
    return language;
  }
  return DEFAULT_MOMENT_LOCALE;
};

const syncMomentLocale = (language?: string): string => {
  const momentLocale = getMomentLocale(language);
  moment.locale(momentLocale);
  return momentLocale;
};

const formatFromNow = (
  date: moment.MomentInput,
  language?: string,
): string => moment(date).locale(getMomentLocale(language)).fromNow();

syncMomentLocale(DEFAULT_MOMENT_LOCALE);

export const MomentLocaleUtils = {
  formatFromNow,
  getMomentLocale,
  syncMomentLocale,
};
