import '@testing-library/jest-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { customRender, screen, waitFor } from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { EvmCustomNftsPageComponent } from 'src/popup/evm/pages/home/evm-custom-nfts-page/evm-custom-nfts-page.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ dataTestId, className, onClick }: any) => (
    <div
      data-testid={dataTestId}
      className={`svg-icon ${className ?? ''}`}
      onClick={onClick}
    />
  ),
}));

describe('EvmCustomNftsPageComponent', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(chrome.i18n, 'getMessage')
      .mockImplementation((key: string, substitutions?: string | string[]) => {
        if (!substitutions) {
          return key;
        }
        return Array.isArray(substitutions)
          ? `${key}:${substitutions.join(',')}`
          : `${key}:${substitutions}`;
      });
    jest.spyOn(EvmTokensUtils, 'getCustomNfts').mockResolvedValue([
      {
        address: '0x00000000000000000000000000000000000000AA',
        type: EVMSmartContractType.ERC721,
        tokenIds: ['1', '2'],
      },
    ]);
  });

  it('lists saved custom NFTs and reopens the popup in edit mode', async () => {
    const user = userEvent.setup();

    customRender(<EvmCustomNftsPageComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          isCustom: true,
          chainId: '0x539',
          name: 'Local',
        },
        evm: {
          ...initialEmptyStateStore.evm,
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            wallet: {
              address: '0x1111111111111111111111111111111111111111',
            } as any,
            nfts: {
              value: [],
              loading: false,
              initialized: true,
            },
          },
        },
      },
    });

    await waitFor(() => {
      expect(EvmTokensUtils.getCustomNfts).toHaveBeenCalled();
    });

    expect(
      screen.getByTestId(
        'btn-delete-custom-nft-0x00000000000000000000000000000000000000AA',
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByText(
        EvmFormatUtils.formatAddress(
          '0x00000000000000000000000000000000000000AA',
        ),
      ),
    );

    expect(await screen.findByTestId('custom-asset-popup')).toBeInTheDocument();
    expect(screen.getByTestId('custom-asset-token-ids')).toHaveValue('1, 2');
  });
});
