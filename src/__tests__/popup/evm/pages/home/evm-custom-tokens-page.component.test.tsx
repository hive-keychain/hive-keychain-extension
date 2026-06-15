import '@testing-library/jest-dom';
import { KeychainApi } from '@api/keychain';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { EvmCustomTokensPageComponent } from '@popup/evm/pages/home/evm-custom-tokens-page/evm-custom-tokens-page.component';
import {
  customRender,
  screen,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import React from 'react';

describe('EvmCustomTokensPageComponent', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(chrome.i18n, 'getMessage')
      .mockImplementation((key: string) => key);
    jest.spyOn(EvmTokensUtils, 'getCustomTokens').mockResolvedValue([
      {
        address: '0x0000000000000000000000000000000000000001',
        type: EVMSmartContractType.ERC20,
        metadata: {
          type: EVMSmartContractType.ERC20,
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          logo: '',
        },
      },
    ]);
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      tokens: {
        1: [
          {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000001',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: '',
            marketCapUSD: 30000000000,
          },
          {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000002',
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            logoURI: '',
            marketCapUSD: 90000000000,
          },
        ],
      },
    });
  });

  it('lists saved tokens before known addable tokens and excludes already added addresses', async () => {
    customRender(<EvmCustomTokensPageComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          isCustom: true,
          chainId: '0x1',
          name: 'Ethereum',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            wallet: {
              address: '0x1111111111111111111111111111111111111111',
            } as any,
            nativeAndErc20Tokens: {
              value: [
                {
                  tokenInfo: {
                    type: EVMSmartContractType.ERC20,
                    contractAddress:
                      '0x0000000000000000000000000000000000000002',
                  },
                },
              ],
              loading: false,
              initialized: true,
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(EvmTokensUtils.getCustomTokens).toHaveBeenCalled();
    });

    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(
      screen.getByText('evm_custom_tokens_add_section_title'),
    ).toBeInTheDocument();
    expect(await screen.findByText('USDT')).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        'known-token-item-0x0000000000000000000000000000000000000001',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId(
        'known-token-item-0x0000000000000000000000000000000000000002',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('btn-add-custom-token-page')).toHaveTextContent(
      'evm_add_custom_token_manually',
    );
  });
});
