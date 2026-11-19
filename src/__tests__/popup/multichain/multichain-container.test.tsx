import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { MultichainContainerComponent } from '@popup/multichain/multichain-container';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('@popup/multichain/actions/chain.actions', () => ({
  setChain: jest.fn((chain) => ({ type: 'SET_CHAIN', payload: chain })),
}));

jest.mock('@popup/multichain/chain.component', () => ({
  ChainComponentWithBoundary: ({ chain }: { chain?: { name?: string } }) => (
    <div data-testid="chain-content">{chain?.name}</div>
  ),
}));

jest.mock('hotkeys-js', () => {
  const hotkeys = jest.fn();
  hotkeys.unbind = jest.fn();
  return { __esModule: true, default: hotkeys };
});

describe('MultichainContainerComponent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders with the cached active chain while its refresh is pending', async () => {
    const cachedEthereumChain = {
      name: 'Ethereum',
      type: ChainType.EVM,
      chainId: '0x1',
      logo: '',
      mainToken: 'ETH',
      rpcs: [],
    };

    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({
        [LocalStorageKeyEnum.ACTIVE_THEME]: Theme.DARK,
        [LocalStorageKeyEnum.ACTIVE_CHAIN]: cachedEthereumChain.chainId,
        [LocalStorageKeyEnum.DEFAULT_CHAINS]: [cachedEthereumChain],
        [LocalStorageKeyEnum.CUSTOM_CHAINS]: [],
        [LocalStorageKeyEnum.SHORTCUTS]: [],
        [LocalStorageKeyEnum.SHORTCUT_PRESETS_MIGRATED]: true,
      });
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue([]);
    jest
      .spyOn(ChainUtils, 'getChain')
      .mockImplementation(() => new Promise(() => undefined));

    const { getByTestId } = customRender(
      <MultichainContainerComponent initialTheme={Theme.DARK} />,
      { initialState: initialEmptyStateStore },
    );

    await waitFor(() => {
      expect(getByTestId('chain-content')).toHaveTextContent('Ethereum');
    });
    expect(ChainUtils.getChain).toHaveBeenCalledWith('0x1');
  });
});
