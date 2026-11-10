import { VaultKey } from '@reference-data/vault-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { resetKeychain } from 'src/popup/multichain/actions/reset-keychain.actions';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

describe('resetKeychain', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('clears accounts, the master password, signup state, and local storage', async () => {
    jest.spyOn(VaultUtils, 'removeFromVault').mockResolvedValue(undefined);
    jest
      .spyOn(LocalStorageUtils, 'clearLocalStorage')
      .mockResolvedValue(undefined);
    const store = getFakeStore({
      ...initialEmptyStateStore,
      mk: mk.user.one,
      hasFinishedSignup: true,
      hive: {
        ...initialEmptyStateStore.hive,
        accounts: [{ name: 'alice', keys: {} }],
      },
    });

    await store.dispatch<any>(resetKeychain());

    expect(store.getState().mk).toBe('');
    expect(store.getState().hasFinishedSignup).toBe(false);
    expect(store.getState().hive.accounts).toEqual([]);
    expect(store.getState().evm.accounts).toEqual([]);
    expect(LocalStorageUtils.clearLocalStorage).toHaveBeenCalled();
    expect(VaultUtils.removeFromVault).toHaveBeenCalledWith(VaultKey.__MK);
  });
});
