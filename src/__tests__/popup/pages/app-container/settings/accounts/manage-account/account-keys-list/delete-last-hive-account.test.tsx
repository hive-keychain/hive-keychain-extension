import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { customRender, screen } from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { AccountKeysListComponent } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/account-keys-list/account-keys-list.component';
import { Screen } from 'src/interfaces/screen.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

const alice: LocalAccount = {
  name: 'alice',
  keys: { posting: 'posting', postingPubkey: 'STM1' },
};
const bob: LocalAccount = {
  name: 'bob',
  keys: { active: 'active', activePubkey: 'STM2' },
};

const renderKeysList = (
  hiveAccounts: LocalAccount[],
  evmAccounts: unknown[] = [],
) => {
  return customRender(
    <AccountKeysListComponent
      selectedAccountName="alice"
      onAccountSelected={jest.fn()}
    />,
    {
      initialState: {
        ...initialEmptyStateStore,
        mk: 'password',
        hasFinishedSignup: true,
        hive: {
          ...initialEmptyStateStore.hive,
          accounts: hiveAccounts,
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: evmAccounts,
        },
      },
    },
  );
};

describe('deleting a Hive account', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the delete button for the last Hive account and resets Keychain when nothing else remains', async () => {
    const user = userEvent.setup();
    jest.spyOn(VaultUtils, 'removeFromVault').mockResolvedValue(undefined);
    jest
      .spyOn(LocalStorageUtils, 'clearLocalStorage')
      .mockResolvedValue(undefined);
    const { store } = renderKeysList([alice]);

    await user.click(screen.getByTestId('button-delete-account'));

    const confirmation = store.getState().navigation.stack[0];
    expect(confirmation.currentPage).toBe(Screen.CONFIRMATION_PAGE);
    expect(confirmation.params.message).toContain(
      'Deleting the last account on Keychain will completely reset Keychain.',
    );
    expect(confirmation.params.message).toContain('reset-keychain-warning');
    expect(confirmation.params.warningMessage).toBeUndefined();

    await confirmation.params.afterConfirmAction();

    expect(LocalStorageUtils.clearLocalStorage).toHaveBeenCalled();
    expect(store.getState().mk).toBe('');
    expect(store.getState().hasFinishedSignup).toBe(false);
    expect(store.getState().hive.accounts).toEqual([]);
  });

  it('does not warn about a full reset when another Hive account remains', async () => {
    const user = userEvent.setup();
    const { store } = renderKeysList([alice, bob]);

    await user.click(screen.getByTestId('button-delete-account'));

    expect(store.getState().navigation.stack[0].params.warningMessage).toBe(
      undefined,
    );
  });

  it('does not warn about a full reset when an EVM account remains', async () => {
    const user = userEvent.setup();
    const { store } = renderKeysList([alice], [
      {
        id: 0,
        seedId: 1,
        wallet: { address: '0xabc' },
      },
    ]);

    await user.click(screen.getByTestId('button-delete-account'));

    expect(store.getState().navigation.stack[0].params.warningMessage).toBe(
      undefined,
    );
  });
});
