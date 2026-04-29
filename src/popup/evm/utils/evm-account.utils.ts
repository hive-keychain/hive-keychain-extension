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

const getAccountFullname = (account: EvmAccount) => {
  if (account.nickname && account.nickname.length > 0) return account.nickname;

  return `${getSeedName(account)} - ${chrome.i18n.getMessage(
    'dialog_account',
  )} ${account.id + 1}`;
};

const getAccountName = (account: EvmAccount) => {
  if (account.nickname && account.nickname.length > 0) return account.nickname;
  return `${chrome.i18n.getMessage('dialog_account')} ${account.id + 1}`;
};

const getDefaultSeedName = (
  accounts: Pick<EvmAccount, 'seedNickname'>[],
) => {
  const defaultSeedNamePrefix = `${chrome.i18n.getMessage('common_seed')} #`;
  const maxDefaultSeedNameId = accounts.reduce((max, account) => {
    const seedName = account.seedNickname;
    if (!seedName?.startsWith(defaultSeedNamePrefix)) return max;

    const seedNameId = Number(seedName.slice(defaultSeedNamePrefix.length));
    return Number.isInteger(seedNameId) && seedNameId > max ? seedNameId : max;
  }, 0);

  return `${defaultSeedNamePrefix}${maxDefaultSeedNameId + 1}`;
};

const getSeedName = (account: EvmAccount) => {
  return account.seedNickname && account.seedNickname.length > 0
    ? account.seedNickname
    : `${chrome.i18n.getMessage('common_seed')} ${account.seedId}`;
};

export const EvmAccountUtils = {
  filterSpamTokens,
  getAccountFullname,
  getAccountName,
  getDefaultSeedName,
  getSeedName,
};
