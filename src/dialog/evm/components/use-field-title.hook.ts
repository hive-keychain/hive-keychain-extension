import { useEffect, useState } from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
export const useFieldTitle = (name?: string) => {
  const [fieldTitle, setFieldTitle] = useState<string>();

  useEffect(() => {
    if (name) {
      const t = I18nUtils.getMessage(name);
      setFieldTitle(t && t.length > 0 ? t : name);
    }
  }, []);

  return fieldTitle;
};
