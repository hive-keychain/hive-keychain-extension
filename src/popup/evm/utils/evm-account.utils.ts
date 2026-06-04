import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmAccountOrPublic,
  EvmAccountPublic,
} from '@popup/evm/interfaces/wallet.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
type EvmAccountDisplayFields = Pick<
  EvmAccountOrPublic,
  'nickname' | 'id' | 'seedId' | 'seedNickname'
>;

export const getEvmAccountAddress = (
  account: EvmAccountOrPublic,
): string => {
  return 'wallet' in account
    ? account.wallet.address
    : (account as EvmAccountPublic).address;
};

const filterSpamTokens = (tokens: NativeAndErc20Token[]) => {
  return tokens.filter(
    (token) =>
      token.tokenInfo.type === EVMSmartContractType.NATIVE ||
      !token.tokenInfo.possibleSpam,
  );
};

const getAccountFullname = (account: EvmAccountDisplayFields) => {
  if (account.nickname && account.nickname.length > 0) return account.nickname;

  return `${getSeedName(account)} - ${I18nUtils.getMessage(
    'dialog_account',
  )} ${account.id + 1}`;
};

const getAccountName = (account: EvmAccountDisplayFields) => {
  if (account.nickname && account.nickname.length > 0) return account.nickname;
  return `${I18nUtils.getMessage('dialog_account')} ${account.id + 1}`;
};

const getDefaultSeedName = (
  accounts: Pick<EvmAccountOrPublic, 'seedNickname'>[],
) => {
  const defaultSeedNamePrefix = `${I18nUtils.getMessage('common_seed')} #`;
  const maxDefaultSeedNameId = accounts.reduce((max, account) => {
    const seedName = account.seedNickname;
    if (!seedName?.startsWith(defaultSeedNamePrefix)) return max;

    const seedNameId = Number(seedName.slice(defaultSeedNamePrefix.length));
    return Number.isInteger(seedNameId) && seedNameId > max ? seedNameId : max;
  }, 0);

  return `${defaultSeedNamePrefix}${maxDefaultSeedNameId + 1}`;
};

const getSeedName = (account: EvmAccountDisplayFields) => {
  return account.seedNickname && account.seedNickname.length > 0
    ? account.seedNickname
    : `${I18nUtils.getMessage('common_seed')} ${account.seedId}`;
};

export const EvmAccountUtils = {
  filterSpamTokens,
  getAccountFullname,
  getAccountName,
  getDefaultSeedName,
  getEvmAccountAddress,
  getSeedName,
};
