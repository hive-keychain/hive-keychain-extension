import { KeychainRequest } from 'hive-keychain-commons';
import { useEffect, useState } from 'react';
import PhishingUtils from 'src/utils/phishing.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export const useDomainCheck = (data: KeychainRequest) => {
  const [header, setHeader] = useState<string | undefined>(undefined);
  useEffect(() => {
    PhishingUtils.getBlacklistedDomains().then((domains: string[]) => {
      let warning;
      if (domains.includes(data.domain)) {
        warning = I18nUtils.getMessage('popup_warning_phishing_domain', [
          data.domain,
        ]);
      }
      setHeader(warning ? warning : undefined);
    });
  }, []);
  return header;
};
