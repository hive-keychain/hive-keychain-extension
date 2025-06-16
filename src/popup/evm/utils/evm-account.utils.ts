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
const getAccountName = (account: EvmAccount) => {
  console.log(account);
  if (account.nickname && account.nickname.length > 0) return account.nickname;
  return `${
    account.seedNickname ??
    `${chrome.i18n.getMessage('common_seed')} ${account.seedId} `
  } ${chrome.i18n.getMessage('dialog_account')} ${account.id + 1}`;
};

const getSeedName = (account: EvmAccount) => {
  return (
    account.seedNickname ??
    `${chrome.i18n.getMessage('common_seed')} ${account.seedId}`
  );
};

export const EvmAccountUtils = {
  filterSpamTokens,
  getAccountName,
  getSeedName,
};
