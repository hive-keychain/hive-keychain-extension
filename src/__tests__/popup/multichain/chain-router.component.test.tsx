import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';
import {
  LoadingValuesConfiguration,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { ChainRouterComponent } from 'src/popup/multichain/chain-router.component';
import { SignUpScreen } from 'src/popup/multichain/sign-up.context';
import { I18nUtils } from 'src/utils/i18n.utils';
import LegalDocumentsUtils from 'src/utils/legal-documents.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

jest.mock('@popup/multichain/unlocked-app.component', () => {
  const React = require('react');
  return {
    UnlockedAppComponent: () =>
      React.createElement('div', { 'data-testid': 'unlocked-app' }),
  };
});

describe('ChainRouter sign-in', () => {
  afterEach(() => {
    EncryptUtils.clearDerivedKeyCache();
    jest.restoreAllMocks();
  });

  it('shows the wrong-password error and stays locked with one Hive account and no EVM accounts', async () => {
    const encryptedAccounts = await EncryptUtils.encryptJson(
      { list: [localAccounts.user1] },
      mk.user.one,
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.HAS_FINISHED_SIGNUP) return true;
        if (key === LocalStorageKeyEnum.ACCOUNTS) return encryptedAccounts;
        return undefined;
      });
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({});
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);
    jest
      .spyOn(LegalDocumentsUtils, 'needsLegalDocumentAcceptance')
      .mockResolvedValue(false);
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('');
    const saveVault = jest
      .spyOn(VaultUtils, 'saveValueInVault')
      .mockResolvedValue(true);
    const store = getFakeStore();
    const { findByTestId, findByText, getByTestId, queryByTestId } = render(
      <Provider store={store}>
        <ChainRouterComponent screen={SignUpScreen.SIGN_UP} />
      </Provider>,
    );

    fireEvent.change(await findByTestId('password-input'), {
      target: { value: mk.user.two },
    });
    fireEvent.click(getByTestId('login-button'));

    await findByText(I18nUtils.getMessage('wrong_password'));
    expect(getByTestId('sign-in-page')).toBeTruthy();
    expect(queryByTestId('unlocked-app')).toBeNull();
    expect(store.getState().mk).toBe('');
    expect(saveVault).not.toHaveBeenCalled();
  });
});

describe('ChainRouter startup', () => {
  beforeEach(() => {
    LoadingValuesConfiguration.set();
    jest.useFakeTimers();
    chrome.runtime.onMessage.addListener = jest.fn();
    chrome.runtime.onMessage.removeListener = jest.fn();
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('');
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.HAS_FINISHED_SIGNUP) return false;
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) return false;
        return undefined;
      });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows only the splashscreen until router startup is resolved', async () => {
    const { container, queryByTestId } = customRender(
      <ChainRouterComponent screen={undefined as any} />,
      {
        initialState: {
          ...initialEmptyStateStore,
          mk: '',
          hasFinishedSignup: null,
        },
      },
    );

    expect(container.querySelector('.splashscreen')).not.toBeNull();
    expect(queryByTestId('signup-page')).toBeNull();
    expect(queryByTestId('sign-in-page')).toBeNull();

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(queryByTestId('signup-page')).not.toBeNull();
    });
  });

  it('renders the unlocked app without branching on chain type after unlock', async () => {
    const { queryByTestId } = customRender(
      <ChainRouterComponent screen={undefined as any} />,
      {
        initialState: {
          ...initialEmptyStateStore,
          mk: 'mk',
          hasFinishedSignup: true,
        },
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(queryByTestId('unlocked-app')).not.toBeNull();
    });
  });

  it('unlocks an open surface when the wallet is unlocked from a dialog', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.HAS_FINISHED_SIGNUP) return true;
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) return false;
        return undefined;
      });
    const getMkSpy = jest.spyOn(VaultUtils, 'getValueFromVault');
    const { queryByTestId, store } = customRender(
      <ChainRouterComponent screen={undefined as any} />,
      {
        initialState: {
          ...initialEmptyStateStore,
          mk: '',
          hasFinishedSignup: true,
        },
      },
    );

    await waitFor(() => {
      expect(queryByTestId('sign-in-page')).not.toBeNull();
    });

    getMkSpy.mockResolvedValue('dialog-mk');
    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];

    await act(async () => {
      walletLockStateListener({
        command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
      });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(store.getState().mk).toBe('dialog-mk');
      expect(queryByTestId('unlocked-app')).not.toBeNull();
    });
  });

  it('stays locked when the vault has no master key', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.HAS_FINISHED_SIGNUP) return true;
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) return false;
        return undefined;
      });
    const { queryByTestId, store } = customRender(
      <ChainRouterComponent screen={undefined as any} />,
      {
        initialState: {
          ...initialEmptyStateStore,
          mk: '',
          hasFinishedSignup: true,
        },
      },
    );

    await waitFor(() => {
      expect(queryByTestId('sign-in-page')).not.toBeNull();
    });

    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];
    await act(async () => {
      walletLockStateListener({
        command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
      });
      await Promise.resolve();
    });

    expect(store.getState().mk).toBe('');
    expect(queryByTestId('sign-in-page')).not.toBeNull();
  });

  it('ignores unrelated messages and removes the listener on unmount', async () => {
    const getMkSpy = jest.spyOn(VaultUtils, 'getValueFromVault');
    const { unmount } = customRender(
      <ChainRouterComponent screen={undefined as any} />,
      {
        initialState: {
          ...initialEmptyStateStore,
          mk: '',
          hasFinishedSignup: true,
        },
      },
    );

    await waitFor(() => {
      expect(getMkSpy).toHaveBeenCalledTimes(1);
    });

    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];
    walletLockStateListener({ command: BackgroundCommand.PING });
    expect(getMkSpy).toHaveBeenCalledTimes(1);

    unmount();
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(
      walletLockStateListener,
    );
  });
});
