import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { getRequestedConnectionPermission } from '@background/evm/requests/logic/wallet-request-permissions.logic';

describe('wallet request permissions logic', () => {
  it('returns eth_accounts for eth_requestAccounts', () => {
    expect(
      getRequestedConnectionPermission({
        method: EvmRequestMethod.REQUEST_ACCOUNTS,
        params: [],
      }),
    ).toBe(EvmRequestPermission.ETH_ACCOUNTS);
  });

  it('returns the validated permission for wallet_requestPermissions', () => {
    expect(
      getRequestedConnectionPermission({
        method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        params: [{ [EvmRequestPermission.ETH_ACCOUNTS]: {} }],
      }),
    ).toBe(EvmRequestPermission.ETH_ACCOUNTS);
  });

  it('returns undefined for unrelated or invalid requests', () => {
    expect(
      getRequestedConnectionPermission({
        method: EvmRequestMethod.GET_CHAIN,
        params: [],
      }),
    ).toBeUndefined();
    expect(
      getRequestedConnectionPermission({
        method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        params: [{ wallet_snap: {} } as any],
      }),
    ).toBeUndefined();
  });
});
