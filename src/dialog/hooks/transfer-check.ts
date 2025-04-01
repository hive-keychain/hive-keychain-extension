import {
  RequestSendToken,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { useEffect, useState } from 'react';
import CurrencyUtils, {
  BaseCurrencies,
} from 'src/popup/hive/utils/currency.utils';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';
import PhishingUtils from 'src/utils/phishing.utils';

export const useTransferCheck = (
  data: RequestTransfer | RequestSendToken,
  rpc: Rpc,
) => {
  const [header, setHeader] = useState<string | undefined>(undefined);
  useEffect(() => {
    PhishingUtils.getPhishingAccounts().then((accs: string[]) => {
      let warning;
      if (accs.includes(data.to)) {
        warning = chrome.i18n.getMessage('popup_warning_phishing', [data.to]);
      } else {
        warning = TransferUtils.getTransferWarning(
          data.to,
          data.type === 'transfer'
            ? CurrencyUtils.getCurrencyLabels(rpc.testnet)[
                data.currency.toLowerCase() as BaseCurrencies
              ]
            : data.currency,
          data.memo,
          accs,
        );
      }
      setHeader(warning ? warning : undefined);
    });
  }, []);
  return header;
};
