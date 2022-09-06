import { ExtendedAccount } from '@hiveio/dhive';
import AccountUtils from 'src/utils/account.utils';

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

const ProxyUtils = { findUserProxy };

export default ProxyUtils;
