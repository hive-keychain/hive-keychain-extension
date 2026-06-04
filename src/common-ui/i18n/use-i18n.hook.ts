import { useTranslation } from 'react-i18next';
import { I18nUtils } from 'src/utils/i18n.utils';

export const useI18n = () => {
  const { i18n, t } = useTranslation();

  return {
    i18n,
    t: (key: string, params?: string | string[]) =>
      I18nUtils.getMessageFromTFunction(t, key, params),
  };
};
