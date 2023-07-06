import AccountUtils from '@hiveapp/utils/account.utils';
import { GovernanceUtils } from '@hiveapp/utils/governance.utils';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { AccountWitnessProxyOperation, ExtendedAccount } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';

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
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);
  return await HiveTxUtils.sendOperation(
    [getSetProxyOperation(proxyName, username)],
    activeKey,
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

const removeProxy = async (username: string, activeKey: Key) => {
  return setAsProxy('', username, activeKey);
};

const ProxyUtils = {
  findUserProxy,
  setAsProxy,
  removeProxy,
  getSetProxyOperation,
  getSetProxyTransaction,
};

export default ProxyUtils;
