import { useEffect, useState } from 'react';

export const useFieldTitle = (name?: string) => {
  const [fieldTitle, setFieldTitle] = useState<string>();

  useEffect(() => {
    if (name) {
      const t = chrome.i18n.getMessage(name);
      setFieldTitle(t && t.length > 0 ? t : name);
    }
  }, []);

  return fieldTitle;
};
