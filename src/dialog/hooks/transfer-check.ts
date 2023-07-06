import CurrencyUtils, { BaseCurrencies } from '@hiveapp/utils/currency.utils';
import { getPhishingAccounts } from '@hiveapp/utils/phishing.utils';
import TransferUtils from '@hiveapp/utils/transfer.utils';
import {
  RequestSendToken,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { useEffect, useState } from 'react';

export const useTransferCheck = (
  data: RequestTransfer | RequestSendToken,
  rpc: Rpc,
) => {
  const [header, setHeader] = useState<string | undefined>(undefined);
  useEffect(() => {
    getPhishingAccounts().then((accs: string[]) => {
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
