import { act, waitFor } from '@testing-library/react';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  LoadingValuesConfiguration,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { ChainRouterComponent } from 'src/popup/multichain/chain-router.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

jest.mock('@popup/multichain/unlocked-app.component', () => {
  const React = require('react');
  return {
    UnlockedAppComponent: () =>
      React.createElement('div', { 'data-testid': 'unlocked-app' }),
  };
});

describe('ChainRouter startup', () => {
  beforeEach(() => {
    LoadingValuesConfiguration.set();
    jest.useFakeTimers();
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

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('.splashscreen')).not.toBeNull();
    expect(queryByTestId('signup-page')).toBeNull();
    expect(queryByTestId('sign-in-page')).toBeNull();

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
});
