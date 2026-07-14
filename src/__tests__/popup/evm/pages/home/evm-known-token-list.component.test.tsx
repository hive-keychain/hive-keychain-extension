import '@testing-library/jest-dom';
import { KeychainApi } from '@api/keychain';
import { EvmKnownTokenList } from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-known-token-list.component';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';

const chain = {
  type: ChainType.EVM,
  name: 'Ethereum',
  chainId: '0x1',
} as any;

const buildToken = (
  index: number,
  overrides: Record<string, unknown> = {},
) => ({
  chainId: 1,
  address: `0x${index.toString(16).padStart(40, '0')}`,
  name: `Token ${index}`,
  symbol: `TKN${index}`,
  decimals: 18,
  logoURI: '',
  marketCapUSD: 1000 - index,
  ...overrides,
});

describe('EvmKnownTokenList', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    LiFiUtils.clearKnownTokensCache();
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('filters out known tokens whose address is already added', async () => {
    const onSave = jest.fn();
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      tokens: {
        1: [
          buildToken(1, { name: 'USD Coin', symbol: 'USDC' }),
          buildToken(2, { name: 'Tether USD', symbol: 'USDT' }),
        ],
      },
    });

    render(
      <EvmKnownTokenList
        chain={chain}
        existingAddresses={['0x0000000000000000000000000000000000000001']}
        onSave={onSave}
      />,
    );

    expect(await screen.findByText('USDT')).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        'known-token-item-0x0000000000000000000000000000000000000001',
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId(
        'known-token-item-0x0000000000000000000000000000000000000002',
      ),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        contractAddress: '0x0000000000000000000000000000000000000002',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 18,
        logo: '',
      });
    });
  });

  it('renders more known tokens when the list is scrolled near the bottom', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      tokens: {
        1: Array.from({ length: 30 }, (_, index) => buildToken(index + 1)),
      },
    });

    render(<EvmKnownTokenList chain={chain} onSave={jest.fn()} />);

    expect(await screen.findByText('TKN25')).toBeInTheDocument();
    expect(screen.queryByText('TKN26')).not.toBeInTheDocument();

    const tokenList = screen.getByTestId('known-token-items');
    Object.defineProperty(tokenList, 'scrollTop', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(tokenList, 'clientHeight', {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(tokenList, 'scrollHeight', {
      configurable: true,
      value: 1200,
    });
    fireEvent.scroll(tokenList);

    await waitFor(() => {
      expect(screen.getByText('TKN26')).toBeInTheDocument();
    });
  });
});
