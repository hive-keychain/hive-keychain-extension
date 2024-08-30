import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';

const filterSpamTokens = (tokens: EVMToken[]) => {
  return tokens.filter(
    (token) =>
      token.tokenInfo.type === EVMTokenType.NATIVE ||
      !token.tokenInfo.possibleSpam,
  );
};
const getDefaultAccountName = (account: EvmAccount) => {
  return `${chrome.i18n.getMessage('dialog_account')} ${account.id + 1}`;
};

export const EvmAccountUtils = { filterSpamTokens, getDefaultAccountName };
