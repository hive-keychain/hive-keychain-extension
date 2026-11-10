import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { LiFiConfirmationPageComponent } from '@popup/evm/pages/home/evm-lifi-swap/lifi-confirmation-page/lifi-confirmation-page.component';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { useTransactionHook } from '@dialog/evm/requests/transaction-warnings/transaction.hook';

const mockGasFeePanel = jest.fn(() => <div data-testid="gas-fee-panel" />);

jest.mock('@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component', () => ({
  GasFeePanel: (props: any) => mockGasFeePanel(props),
}));

jest.mock('src/common-ui/evm/evm-swap-confirmation-balance.component', () => ({
  EvmSwapConfirmationBalance: () => (
    <div data-testid="swap-confirmation-balance" />
  ),
}));

jest.mock('@dialog/evm/requests/transaction-warnings/transaction.hook', () => ({
  useTransactionHook: jest.fn(),
}));

describe('LiFiConfirmationPageComponent', () => {
  const chain: EvmChain = {
    chainId: '1',
    defaultTransactionType: EvmTransactionType.EIP_1559,
    logo: '',
    mainToken: 'ETH',
    name: 'Ethereum',
    rpcs: [],
    type: ChainType.EVM,
  };

  const renderConfirmationPage = () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      evm: {
        ...initialEmptyStateStore.evm,
        activeAccount: {
          ...initialEmptyStateStore.evm.activeAccount,
          wallet: {
            address: '0x00000000000000000000000000000000000000aa',
          },
        },
      },
      navigation: {
        stack: [
          {
            params: {
              afterConfirmAction: jest.fn(),
              approveFields: [
                {
                  label: 'evm_approval_operation',
                  value: 'Approval',
                },
              ],
              approveTransactionData: {
                chain,
                data: '0x',
                from: '0x00000000000000000000000000000000000000aa',
                to: '0x000000000000000000000000000000000000bb',
                type: EvmTransactionType.EIP_1559,
                value: '0x0',
              },
              swapFields: [
                {
                  label: 'evm_swap_operation',
                  value: 'Swap',
                },
              ],
              swapTransactionData: {
                chain,
                data: '0x',
                from: '0x00000000000000000000000000000000000000aa',
                to: '0x000000000000000000000000000000000000cc',
                type: EvmTransactionType.EIP_1559,
                value: '0x0',
              },
              swapBalanceContext: {
                swapAmount: 1,
                fromToken: {
                  address: '0x00000000000000000000000000000000000000aa',
                  symbol: 'USDC',
                  name: 'USD Coin',
                  decimals: 6,
                },
              },
            },
          },
        ],
      },
    } as any);

    return render(
      <Provider store={store}>
        <LiFiConfirmationPageComponent />
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTransactionHook as jest.Mock).mockReturnValue({
      hasWarning: jest.fn().mockReturnValue(false),
      setConfirmationPageFields: jest.fn(),
      openWarningsPopup: jest.fn(),
    });
  });

  it('renders gas fee panels outside operation fields panels', async () => {
    const { container } = renderConfirmationPage();

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalledTimes(2));

    const fieldsPanels = container.querySelectorAll('.fields');
    const gasFeePanels = container.querySelectorAll(
      '[data-testid="gas-fee-panel"]',
    );

    expect(fieldsPanels).toHaveLength(2);
    expect(gasFeePanels).toHaveLength(2);
    expect(
      container.querySelector('[data-testid="swap-confirmation-balance"]'),
    ).not.toBeNull();
    fieldsPanels.forEach((fieldsPanel) => {
      expect(fieldsPanel.querySelector('[data-testid="gas-fee-panel"]')).toBe(
        null,
      );
    });
  });
});
