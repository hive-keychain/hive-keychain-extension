import { KeychainRequest } from 'hive-keychain-commons';
import { useEffect, useState } from 'react';
import PhishingUtils from 'src/utils/phishing.utils';

export const useDomainCheck = (data: KeychainRequest) => {
  const [header, setHeader] = useState<string | undefined>(undefined);
  useEffect(() => {
    PhishingUtils.getBlacklistedDomains().then((domains: string[]) => {
      let warning;
      if (domains.includes(data.domain)) {
        warning = chrome.i18n.getMessage('popup_warning_phishing_domain', [
          data.domain,
        ]);
      }
      setHeader(warning ? warning : undefined);
    });
  }, []);
  return header;
};
