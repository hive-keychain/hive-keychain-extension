import type {
  AccountWitnessProxyOperation,
  ExtendedAccount,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { GovernanceUtils } from 'src/popup/hive/utils/governance.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

const findUserProxy = async (user: ExtendedAccount): Promise<string | null> => {
  const previousChecked: string[] = [user.name!];
  if (user.proxy.length === 0) return null;
  else {
    let proxy = user.proxy;
    do {
      if (previousChecked.includes(proxy)) return null;
      previousChecked.push(proxy);
      proxy = (await AccountUtils.getExtendedAccount(proxy)).proxy;
    } while (proxy.length !== 0);
    return previousChecked[previousChecked.length - 1];
  }
};

const setAsProxy = async (
  proxyName: string,
  username: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);
  return await HiveTxUtils.sendOperation(
    [getSetProxyOperation(proxyName, username)],
    activeKey,
    false,
    options,
  );
};

const getSetProxyOperation = (proxyName: string, username: string) => {
  return [
    'account_witness_proxy',
    { account: username, proxy: proxyName },
  ] as AccountWitnessProxyOperation;
};

const getSetProxyTransaction = (proxyName: string, username: string) => {
  return HiveTxUtils.createTransaction([
    ProxyUtils.getSetProxyOperation(proxyName, username),
  ]);
};

const removeProxy = async (
  username: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return setAsProxy('', username, activeKey, options);
};

const ProxyUtils = {
  findUserProxy,
  setAsProxy,
  removeProxy,
  getSetProxyOperation,
  getSetProxyTransaction,
};

export default ProxyUtils;
