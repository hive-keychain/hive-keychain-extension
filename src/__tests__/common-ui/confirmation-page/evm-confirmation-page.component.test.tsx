import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Screen } from '@interfaces/screen.interface';
import { EVMConfirmationPageComponent } from 'src/common-ui/confirmation-page/evm-confirmation-page.component';
import {
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

const mockGasFeePanel = jest.fn(() => <div data-testid="gas-fee-panel" />);

jest.mock('@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component', () => ({
  GasFeePanel: (props: any) => mockGasFeePanel(props),
}));

jest.mock('src/dialog/evm/requests/transaction-warnings/transaction.hook', () => ({
  useTransactionHook: jest.fn(),
}));

jest.mock('@dialog/components/balance-change-card/balance-change-card.component', () => ({
  BalanceChangeCard: () => <div data-testid="balance-change-card" />,
}));

describe('EVMConfirmationPageComponent', () => {
  const nativeToken: EvmSmartContractInfoNative = {
    backgroundColor: '',
    categories: [],
    chainId: '1',
    coingeckoId: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    logo: 'eth.svg',
    name: 'Ether',
    priceUsd: 123,
    symbol: 'ETH',
    type: EVMSmartContractType.NATIVE,
  };

  const renderConfirmationPage = (params: Record<string, any>) => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain: {
        chainId: '1',
        defaultTransactionType: EvmTransactionType.EIP_1559,
        mainToken: 'ETH',
        name: 'Ethereum',
      } as any,
      evm: {
        ...initialEmptyStateStore.evm,
        activeAccount: {
          ...initialEmptyStateStore.evm.activeAccount,
          address: '0x00000000000000000000000000000000000000aa',
          wallet: {
            address: '0x00000000000000000000000000000000000000aa',
          } as any,
          nativeAndErc20Tokens: {
            loading: false,
            value: [
              {
                balance: 1n,
                balanceInteger: 1,
                formattedBalance: '1',
                shortFormattedBalance: '1',
                tokenInfo: nativeToken,
              },
            ],
          },
        },
      },
      navigation: {
        stack: [
          {
            currentPage: Screen.CONFIRMATION_PAGE,
            params: {
              afterConfirmAction: jest.fn(),
              fields: [],
              hasGasFee: true,
              message: 'Confirm',
              title: 'popup_html_confirm',
              tokenInfo: {
                ...nativeToken,
                type: EVMSmartContractType.ERC1155,
              },
              transactionData: {
                data: '0x',
                from: '0x00000000000000000000000000000000000000aa',
                to: '0x00000000000000000000000000000000000000bb',
                type: EvmTransactionType.EIP_1559,
                value: '0x0',
              },
              wallet: {
                address: '0x00000000000000000000000000000000000000aa',
              },
              ...params,
            },
          },
        ],
      },
    } as any);

    return render(
      <Provider store={store}>
        <EVMConfirmationPageComponent />
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.chrome.i18n.getMessage = jest.fn((key: string) => key);
    (useTransactionHook as jest.Mock).mockReturnValue({
      hasWarning: jest.fn().mockReturnValue(false),
      initPendingTransactionWarning: jest.fn(),
      openSingleWarningPopup: jest.fn(),
      pendingTransactionWarningField: undefined,
      setConfirmationPageFields: jest.fn(),
      setWarningsPopupOpened: jest.fn(),
    });
  });

  it('passes popup native token metadata to GasFeePanel without fetching native metadata again', async () => {
    const getMainTokenInfoSpy = jest.spyOn(EvmTokensUtils, 'getMainTokenInfo');

    renderConfirmationPage({});

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalled());

    expect(mockGasFeePanel).toHaveBeenLastCalledWith(
      expect.objectContaining({
        prefetchedMainTokenInfo: nativeToken,
      }),
    );
    expect(getMainTokenInfoSpy).not.toHaveBeenCalled();
  });

  it('passes popup native token metadata to ERC20 balance-change calculation', async () => {
    const getBalanceInfoSpy = jest
      .spyOn(EvmTokensUtils, 'getBalanceInfo')
      .mockResolvedValue({ mainBalance: {} } as any);

    renderConfirmationPage({
      amount: 5,
      tokenInfo: {
        backgroundColor: '',
        chainId: '1',
        contractAddress: '0x00000000000000000000000000000000000000cc',
        decimals: 6,
        isProxy: false,
        logo: '',
        name: 'USD Coin',
        possibleSpam: false,
        priceUsd: 1,
        proxyTarget: null,
        symbol: 'USDC',
        type: EVMSmartContractType.ERC20,
        validated: 1,
        verifiedContract: true,
      },
    });

    await waitFor(() => expect(getBalanceInfoSpy).toHaveBeenCalled());

    expect(getBalanceInfoSpy).toHaveBeenLastCalledWith(
      '0x00000000000000000000000000000000000000aa',
      expect.objectContaining({ chainId: '1' }),
      expect.objectContaining({ symbol: 'USDC' }),
      5,
      undefined,
      nativeToken,
    );
  });
});
