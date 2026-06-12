import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Screen } from '@interfaces/screen.interface';
import { AccountCreationMode } from '@popup/hive/utils/account-creation.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import {
  LoadingValuesConfiguration,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('HiveApp paid account creation routing', () => {
  const hiveChain = defaultChainList.find(
    (chain) => chain.type === ChainType.HIVE,
  )!;

  beforeEach(() => {
    jest.restoreAllMocks();
    LoadingValuesConfiguration.set({
      app: {
        accountsRelated: {
          AccountUtils: {
            hasStoredAccounts: false,
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders paid account creation instead of forcing add-account setup when no Hive account exists', async () => {
    const fakeStore = getFakeStore({
      ...initialEmptyStateStore,
      chain: hiveChain,
      mk: 'test-master-key',
      hasFinishedSignup: true,
      navigation: {
        params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
        stack: [
          {
            currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
            params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
          },
        ],
      },
      hive: {
        ...initialEmptyStateStore.hive,
        accounts: [],
      },
    });

    render(
      <Provider store={fakeStore}>
        <HiveAppComponent />
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${Screen.CREATE_ACCOUNT_PAGE_STEP_ONE}-page`),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${Screen.ACCOUNT_PAGE_INIT_ACCOUNT}-page`),
    ).not.toBeInTheDocument();
  });
});
