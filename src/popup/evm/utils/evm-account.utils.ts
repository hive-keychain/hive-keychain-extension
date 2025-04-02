import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';

const filterSpamTokens = (tokens: NativeAndErc20Token[]) => {
  return tokens.filter(
    (token) =>
      token.tokenInfo.type === EVMSmartContractType.NATIVE ||
      !token.tokenInfo.possibleSpam,
  );
};
const getDefaultAccountName = (account: EvmAccount) => {
  return `${chrome.i18n.getMessage('dialog_account')} ${account.id + 1}`;
};

export const EvmAccountUtils = { filterSpamTokens, getDefaultAccountName };
