import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletInfoSectionComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section.component';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';

jest.mock('src/common-ui/switch-bar/sliding-bar.component', () => ({
  SlidingBarComponent: ({ values, selectedValue }: any) => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'data-testid': 'tabs', 'data-selected': selectedValue },
      values.map((value: any) =>
        React.createElement('span', { key: value.value }, value.label),
      ),
    );
  },
}));

jest.mock(
  '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-tokens/evm-wallet-tokens.component',
  () => ({
    EvmWalletTokensComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'tokens-panel' });
    },
  }),
);

jest.mock(
  '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-gallery.component',
  () => ({
    EvmWalletNftGalleryComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'nfts-panel' });
    },
  }),
);

jest.mock('@popup/evm/pages/home/token-history/evm-history.component', () => ({
  EvmHistoryComponent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'history-panel' });
  },
}));

const baseChain: EvmChain = {
  name: 'Ethereum',
  type: ChainType.EVM,
  logo: '',
  chainId: '0x1',
  rpcs: [{ url: 'https://rpc.example', isDefault: true }],
  mainToken: 'ETH',
  defaultTransactionType: 2 as any,
};

const baseActiveAccount: EvmActiveAccount = {
  address: '0x1111111111111111111111111111111111111111',
  wallet: { address: '0x1111111111111111111111111111111111111111' } as any,
  isReady: true,
  nativeAndErc20Tokens: {
    value: [],
    loading: false,
    initialized: true,
  },
  nfts: {
    value: [],
    loading: false,
    initialized: true,
  },
  history: {
    value: {
      events: [],
      nextCursor: null,
      fullyFetch: true,
    },
    loading: false,
    initialized: true,
  },
};

const renderWalletInfoSection = (
  activeAccount: EvmActiveAccount = baseActiveAccount,
  chain: EvmChain = baseChain,
  initialDisplayHistory = false,
) =>
  render(
    <EvmWalletInfoSectionComponent
      activeAccount={activeAccount}
      chain={chain}
      onClickOnNftPreview={jest.fn()}
      loadEvmHistory={jest.fn()}
      reloadEvmActiveAccount={jest.fn()}
      initialDisplayHistory={initialDisplayHistory}
    />,
  );

describe('EvmWalletInfoSectionComponent', () => {
  it('hides the history tab when light-node-backed data is unavailable', () => {
    renderWalletInfoSection({
      ...baseActiveAccount,
      nativeAndErc20Tokens: {
        ...baseActiveAccount.nativeAndErc20Tokens,
        lightNodeUnavailable: true,
      },
    });

    expect(screen.getByText('evm_tab_tokens')).toBeInTheDocument();
    expect(screen.getByText('evm_tab_nfts')).toBeInTheDocument();
    expect(screen.queryByText('evm_tab_history')).not.toBeInTheDocument();
    expect(screen.getByTestId('tokens-panel')).toBeInTheDocument();
  });

  it('falls back to tokens when the requested initial history tab is unavailable', () => {
    renderWalletInfoSection(
      {
        ...baseActiveAccount,
        history: {
          ...baseActiveAccount.history,
          lightNodeUnavailable: true,
        },
      },
      baseChain,
      true,
    );

    expect(screen.queryByText('evm_tab_history')).not.toBeInTheDocument();
    expect(screen.getByTestId('tokens-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('history-panel')).not.toBeInTheDocument();
  });

  it('keeps the custom-chain activity tab because it is not light-node backed', () => {
    renderWalletInfoSection(
      {
        ...baseActiveAccount,
        history: {
          ...baseActiveAccount.history,
          lightNodeUnavailable: true,
        },
      },
      {
        ...baseChain,
        isCustom: true,
      },
    );

    expect(screen.getByText('evm_activity_tab')).toBeInTheDocument();
  });
});
