import '@testing-library/jest-dom';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmWalletTokensComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-tokens/evm-wallet-tokens.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmAutoDetectedTokenVisibilityUtils } from '@popup/evm/utils/evm-auto-detected-token-visibility.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import {
  customRender,
  fireEvent,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

describe('EvmWalletTokensComponent', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(chrome.i18n, 'getMessage')
      .mockImplementation((key: string) => key);
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([]);
    jest
      .spyOn(EvmTokensUtils, 'filterTokensBasedOnSettings')
      .mockImplementation(async (tokens) => tokens);
    jest
      .spyOn(
        EvmAutoDetectedTokenVisibilityUtils,
        'getHiddenAutoDetectedTokenAddresses',
      )
      .mockResolvedValue([]);
  });

  it('shows Manage tokens action on supported non-custom chains', async () => {
    const { container, store } = customRender(
      <EvmWalletTokensComponent
        chain={
          {
            ...initialEmptyStateStore.chain,
            type: ChainType.EVM,
            isCustom: false,
            chainId: '0x1',
            name: 'Ethereum',
            manualDiscoverAvailable: false,
            addTokensManually: false,
          } as any
        }
        activeAccount={
          {
            wallet: {
              address: '0x1111111111111111111111111111111111111111',
            },
            nativeAndErc20Tokens: {
              value: [
                {
                  tokenInfo: {
                    type: EVMSmartContractType.ERC20,
                    name: 'USD Coin',
                    symbol: 'USDC',
                    contractAddress:
                      '0x0000000000000000000000000000000000000001',
                  },
                },
              ],
              loading: false,
              initialized: true,
            },
          } as any
        }
        reloadEvmActiveAccount={jest.fn()}
      />,
    );

    const manageTokensAction = container.querySelector('.right-action-icon');

    expect(manageTokensAction).toBeInTheDocument();
    fireEvent.click(manageTokensAction!);

    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        EvmScreen.EVM_CUSTOM_TOKENS_PAGE,
      );
    });
  });
});
