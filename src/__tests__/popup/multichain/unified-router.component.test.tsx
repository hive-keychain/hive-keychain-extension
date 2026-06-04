import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';
import { UnifiedRouterComponent } from 'src/popup/multichain/unified-router.component';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';
import { MultichainScreen } from 'src/popup/multichain/reference-data/multichain-screen.enum';
import { HiveScreen } from 'src/popup/hive/reference-data/hive-screen.enum';

jest.mock('@popup/hive/pages/app-container/home/hive-home.component', () => ({
  HiveHomeComponent: () => <div data-testid="hive-home-route" />,
}));

jest.mock('@popup/evm/pages/home/evm-home.component', () => ({
  EvmHomeComponent: () => <div data-testid="evm-home-route" />,
}));

jest.mock(
  'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account.component',
  () => ({
    ManageAccountComponent: () => <div data-testid="hive-manage-route" />,
  }),
);

const renderRouter = (
  currentPage: MultichainScreen | HiveScreen,
  activeAccountType: ChainType.HIVE | ChainType.EVM,
) => {
  const store = getFakeStore({
    ...initialEmptyStateStore,
    activeAccountType,
    navigation: {
      stack: [{ currentPage }],
    },
  });

  render(
    <Provider store={store}>
      <UnifiedRouterComponent />
    </Provider>,
  );
};

describe('UnifiedRouterComponent', () => {
  it('renders the Hive shared route variant for a Hive active account type', () => {
    renderRouter(MultichainScreen.HOME_PAGE, ChainType.HIVE);

    expect(screen.getByTestId('hive-home-route')).toBeInTheDocument();
  });

  it('renders the EVM shared route variant for an EVM active account type', () => {
    renderRouter(MultichainScreen.HOME_PAGE, ChainType.EVM);

    expect(screen.getByTestId('evm-home-route')).toBeInTheDocument();
  });

  it('renders Hive-only routes even when the active account type is EVM', () => {
    renderRouter(HiveScreen.SETTINGS_MANAGE_ACCOUNTS, ChainType.EVM);

    expect(screen.getByTestId('hive-manage-route')).toBeInTheDocument();
  });
});
