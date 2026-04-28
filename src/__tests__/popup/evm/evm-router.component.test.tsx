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
  '@popup/evm/pages/home/settings/evm-dapps-connections/evm-dapps-connections.component',
  () => ({
    EvmDappsConnectionsComponent: () => (
      <div data-testid="evm-dapps-connections-router-page" />
    ),
  }),
);

describe('EvmRouterComponent', () => {
  it('renders the dApps connections page', () => {
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
      screen.getByTestId('evm-dapps-connections-router-page'),
    ).toBeInTheDocument();
  });
});
