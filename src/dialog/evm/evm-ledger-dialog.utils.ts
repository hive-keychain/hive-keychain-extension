import {
  EvmAccountPublic,
  EvmAccountSource,
} from '@popup/evm/interfaces/wallet.interface';

const LEDGER_CONFIRMATION_CAPTION = 'popup_html_validate_transaction_on_ledger';

const getLedgerConfirmationCaption = (
  account?: Pick<EvmAccountPublic, 'source'>,
) => {
  return account?.source === EvmAccountSource.LEDGER
    ? LEDGER_CONFIRMATION_CAPTION
    : undefined;
};

const getAccountByAddress = (
  accounts: EvmAccountPublic[],
  address?: string,
) => {
  if (!address) return;

  return accounts.find(
    (account) => account.address.toLowerCase() === address.toLowerCase(),
  );
};

const getLedgerConfirmationCaptionForAddress = (
  accounts: EvmAccountPublic[],
  address?: string,
) => getLedgerConfirmationCaption(getAccountByAddress(accounts, address));

export const EvmLedgerDialogUtils = {
  getLedgerConfirmationCaption,
  getLedgerConfirmationCaptionForAddress,
};
