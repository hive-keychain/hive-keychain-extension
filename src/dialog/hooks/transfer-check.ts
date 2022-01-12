import { RequestTransfer } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { useEffect, useState } from 'react';
import CurrencyUtils, { BaseCurrencies } from 'src/utils/currency.utils';
import { getPhishingAccounts } from 'src/utils/phishing.utils';
import TransferUtils from 'src/utils/transfer.utils';

export const useTransferCheck = (data: RequestTransfer, rpc: Rpc) => {
  const [header, setHeader] = useState<string | undefined>(undefined);
  useEffect(() => {
    getPhishingAccounts().then((accs: string[]) => {
      TransferUtils.getExchangeValidationWarning(
        data.to,
        CurrencyUtils.getCurrencyLabels(rpc.testnet)[
          data.currency.toLowerCase() as BaseCurrencies
        ],
        data.memo.length > 0,
      ).then((res: string | null) => {
        if (accs.includes(data.to)) {
          res = chrome.i18n.getMessage('popup_warning_phishing', [data.to]);
        }
        setHeader(res ? res : undefined);
      });
    });
  }, []);
  return header;
};
