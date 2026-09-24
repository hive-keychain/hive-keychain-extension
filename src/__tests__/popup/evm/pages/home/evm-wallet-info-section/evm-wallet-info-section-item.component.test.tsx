import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { NativeAndErc20Token } from 'src/popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from 'src/popup/evm/interfaces/evm-tokens.interface';
import { WalletInfoSectionItem } from 'src/popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmChain } from 'src/popup/multichain/interfaces/chains.interface';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span aria-hidden="true" />,
}));

jest.mock(
  'src/popup/evm/pages/home/evm-token-logo/evm-token-logo.component',
  () => ({
    EvmTokenLogo: () => <span aria-hidden="true" data-testid="evm-token-logo" />,
  }),
);

const mockCopyTextWithToast = jest.fn();
jest.mock('src/common-ui/toast/copy-toast.utils', () => ({
  COPY_GENERIC_MESSAGE_KEY: 'swap_copied_to_clipboard',
  copyTextWithToast: (...args: unknown[]) => mockCopyTextWithToast(...args),
}));

const ethereumChain = {
  blockExplorer: { url: 'https://eth.blockscout.com/' },
} as EvmChain;

describe('EVM WalletInfoSectionItem', () => {
  const tabsCreate = jest.fn();

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    mockCopyTextWithToast.mockClear();
    tabsCreate.mockClear();
    (global as any).chrome = {
      tabs: { create: tabsCreate },
    };
  });

  it('opens the token detail panel and activates actions from the keyboard', async () => {
    const user = userEvent.setup();
    const navigateToWithParams = jest.fn();
    render(
      <WalletInfoSectionItem
        token={
          {
            tokenInfo: {
              symbol: 'ETH',
              type: EVMSmartContractType.NATIVE,
            },
          } as unknown as NativeAndErc20Token
        }
        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
        mainValue="1.0"
        mainValueLabel="Ethereum"
        mainValueSubLabel="ETH"
        chain={ethereumChain}
        navigateToWithParams={navigateToWithParams}
      />,
    );

    const disclosure = screen.getByRole('button', { name: /Ethereum/ });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByTestId('wallet-token-detail-panel-ETH'),
    ).not.toBeInTheDocument();

    disclosure.focus();
    await user.keyboard('{Enter}');
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByTestId('wallet-token-detail-panel-ETH'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-price-chart-ETH'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-detail-panel-ETH-footer'),
    ).toBeInTheDocument();

    const sendButton = await screen.findByRole('button', {
      name: 'popup_html_send_transfer',
    });
    sendButton.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(navigateToWithParams).toHaveBeenCalled());

    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByTestId('wallet-token-detail-panel-ETH'),
    ).not.toBeInTheDocument();
  });

  it('closes the token detail panel on Escape', async () => {
    const user = userEvent.setup();
    render(
      <WalletInfoSectionItem
        token={
          {
            tokenInfo: {
              symbol: 'ETH',
              type: EVMSmartContractType.NATIVE,
            },
          } as unknown as NativeAndErc20Token
        }
        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
        mainValue="1.0"
        mainValueLabel="Ethereum"
        mainValueSubLabel="ETH"
        chain={ethereumChain}
        navigateToWithParams={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Ethereum/ }));
    expect(
      screen.getByTestId('wallet-token-detail-panel-ETH'),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByTestId('wallet-token-detail-panel-ETH'),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows the token logo and a copyable ERC20 contract address in the panel', async () => {
    const user = userEvent.setup();
    const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    render(
      <WalletInfoSectionItem
        token={
          {
            tokenInfo: {
              symbol: 'USDC',
              type: EVMSmartContractType.ERC20,
              contractAddress,
            },
          } as unknown as NativeAndErc20Token
        }
        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
        mainValue="5.0"
        mainValueLabel="USDC"
        mainValueSubLabel="USD Coin"
        chain={ethereumChain}
        navigateToWithParams={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /USDC/ }));

    expect(
      screen.getByTestId('wallet-token-detail-panel-USDC-logo'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-detail-panel-contract-USDC'),
    ).toHaveTextContent(contractAddress);

    const chart = screen.getByTestId('wallet-token-price-chart-USDC');
    const contract = screen.getByTestId(
      'wallet-token-detail-panel-contract-USDC',
    );
    expect(
      chart.compareDocumentPosition(contract) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.click(
      screen.getByTestId('wallet-token-detail-panel-contract-copy-USDC'),
    );
    expect(mockCopyTextWithToast).toHaveBeenCalledWith(
      contractAddress,
      'swap_copied_to_clipboard',
    );
  });

  it('opens the ERC20 token page on the chain block explorer', async () => {
    const user = userEvent.setup();
    const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    render(
      <WalletInfoSectionItem
        token={
          {
            tokenInfo: {
              symbol: 'USDC',
              type: EVMSmartContractType.ERC20,
              contractAddress,
            },
          } as unknown as NativeAndErc20Token
        }
        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
        mainValue="5.0"
        mainValueLabel="USDC"
        mainValueSubLabel="USD Coin"
        chain={ethereumChain}
        navigateToWithParams={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /USDC/ }));
    await user.click(
      screen.getByTestId('wallet-token-detail-panel-contract-explorer-USDC'),
    );

    expect(tabsCreate).toHaveBeenCalledWith({
      url: `https://eth.blockscout.com/token/${contractAddress}`,
    });
  });

  it('hides the explorer button when the chain has no block explorer', async () => {
    const user = userEvent.setup();

    render(
      <WalletInfoSectionItem
        token={
          {
            tokenInfo: {
              symbol: 'USDC',
              type: EVMSmartContractType.ERC20,
              contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            },
          } as unknown as NativeAndErc20Token
        }
        icon={SVGIcons.BLOCKCHAIN_ETHEREUM}
        mainValue="5.0"
        mainValueLabel="USDC"
        mainValueSubLabel="USD Coin"
        chain={{} as EvmChain}
        navigateToWithParams={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /USDC/ }));

    expect(
      screen.queryByTestId('wallet-token-detail-panel-contract-explorer-USDC'),
    ).not.toBeInTheDocument();
  });
});
