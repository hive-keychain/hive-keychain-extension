import '@testing-library/jest-dom';
import { EvmRouterComponent } from '@popup/evm/evm-router.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';

jest.mock(
  'src/popup/multichain/pages/settings/settings-connected-dapps-page.component',
  () => ({
    SettingsConnectedDappsPageComponent: () => (
      <div data-testid="settings-connected-dapps-router-page" />
    ),
  }),
);

jest.mock(
  'src/popup/multichain/pages/settings/settings-main-page.component',
  () => ({
    UnifiedSettingsMainPageComponent: () => (
      <div data-testid="unified-settings-main-router-page" />
    ),
  }),
);

describe('EvmRouterComponent', () => {
  it('aliases the legacy settings route to the unified settings menu', () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      navigation: {
        stack: [{ currentPage: EvmScreen.EVM_SETTINGS }],
      },
    });

    render(
      <Provider store={store}>
        <EvmRouterComponent />
      </Provider>,
    );

    expect(
      screen.getByTestId('unified-settings-main-router-page'),
    ).toBeInTheDocument();
  });

  it('aliases the legacy dApps connections route to unified connected dApps', () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      navigation: {
        stack: [{ currentPage: EvmScreen.EVM_DAPPS_CONNECTIONS }],
      },
    });

    render(
      <Provider store={store}>
        <EvmRouterComponent />
      </Provider>,
    );

    expect(
      screen.getByTestId('settings-connected-dapps-router-page'),
    ).toBeInTheDocument();
  });
});
