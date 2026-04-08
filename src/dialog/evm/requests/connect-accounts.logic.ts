import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { getWalletRequestPermissionsResponse } from '@background/evm/requests/logic/wallet-request-permissions.logic';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';

export const saveConnectedAccountsRequest = async (
  method:
    | EvmRequestMethod.REQUEST_ACCOUNTS
    | EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
  addresses: string[],
  domain: string,
) => {
  await EvmWalletUtils.setConnectedWallets(addresses, domain);
  await EvmAddressesUtils.saveDomainAddress(domain);

  if (method === EvmRequestMethod.REQUEST_ACCOUNTS) {
    return addresses.map((add) => add.toLowerCase());
  }

  return getWalletRequestPermissionsResponse(EvmRequestPermission.ETH_ACCOUNTS);
};
