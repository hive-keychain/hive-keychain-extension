import '@testing-library/jest-dom';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useSelector } from 'react-redux';
import { ModalComponent } from 'src/common-ui/modal/modal.component';
import { RootState } from '@popup/multichain/store';
import { ModalProperties } from '@popup/multichain/interfaces/modal.interface';
import { ChainSelectorPageComponent } from 'src/popup/multichain/pages/chain-selector/chain-selector.component';
import {
  customRender,
  screen,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

const customChain: EvmChain = {
  type: ChainType.EVM,
  chainId: '0x539',
  name: 'Local Custom',
  mainToken: 'ETH',
  defaultTransactionType: EvmTransactionType.EIP_1559,
  rpcs: [{ url: 'http://127.0.0.1:8545', isDefault: true }],
  testnet: false,
  isCustom: true,
};

const fallbackChain = {
  ...initialEmptyStateStore.chain,
  type: ChainType.EVM,
  chainId: '0x1',
  name: 'Ethereum',
};

const supportedChain: EvmChain = {
  type: ChainType.EVM,
  chainId: '0x1',
  name: 'Ethereum',
  mainToken: 'ETH',
  defaultTransactionType: EvmTransactionType.EIP_1559,
  rpcs: [{ url: 'https://rpc.ethereum.org', isDefault: true }],
  testnet: false,
  isCustom: false,
};

const TestModalHost = () => {
  const modal = useSelector((state: RootState) => state.modal) as
    | ModalProperties
    | undefined;
  if (!modal) {
    return null;
  }
  return <ModalComponent {...modal} />;
};

describe('ChainSelectorPageComponent', () => {
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
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([fallbackChain]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([]);
    jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([customChain]);
    jest.spyOn(ChainUtils, 'removeCustomChain').mockResolvedValue(undefined);
    jest.spyOn(EvmChainUtils, 'saveLastUsedChain').mockImplementation(() => {});
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
      url: 'https://rpc.example',
      isDefault: true,
    });
    jest.spyOn(EvmRpcUtils, 'setActiveRpc').mockResolvedValue(undefined);
    jest.spyOn(EvmRpcUtils, 'isValidRpcForChainId').mockResolvedValue(true);
  });

  it('does not render Hive in built-in chain cards', async () => {
    const hiveChain = {
      ...initialEmptyStateStore.chain,
      type: ChainType.HIVE,
      chainId:
        'beeab0de00000000000000000000000000000000000000000000000000000000',
      name: 'HIVE',
    };
    const evmChain = {
      ...fallbackChain,
      chainId: '0x89',
      name: 'Polygon',
    };

    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([
      hiveChain,
      evmChain,
    ]);

    customRender(<ChainSelectorPageComponent hideTitle />);

    await waitFor(() => {
      expect(screen.getByText('Polygon')).toBeInTheDocument();
    });

    expect(screen.queryByText('HIVE')).not.toBeInTheDocument();
  });

  it('removes a custom chain after delete confirmation', async () => {
    const user = userEvent.setup();
    const { store } = customRender(
      <>
        <ChainSelectorPageComponent hideTitle />
        <TestModalHost />
      </>,
      {
        initialState: {
          ...initialEmptyStateStore,
          chain: customChain,
        },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('btn-delete-custom-chain-0x539'),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('btn-delete-custom-chain-0x539'));

    expect(
      await screen.findByTestId('custom-chain-delete-confirm'),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId('custom-chain-delete-confirm'));

    await waitFor(() => {
      expect(ChainUtils.removeCustomChain).toHaveBeenCalledWith('0x539');
    });

    expect(store.getState().chain.chainId).toBe('0x1');
  });

  it('renders settings for supported EVM chains', async () => {
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([
      supportedChain,
    ]);

    customRender(<ChainSelectorPageComponent hideTitle />);

    expect(
      await screen.findByTestId('btn-edit-default-chain-0x1'),
    ).toBeInTheDocument();
  });

  it('saves supported EVM chain edits as default-chain overrides', async () => {
    const user = userEvent.setup();
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([
      supportedChain,
    ]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([
      supportedChain,
    ]);
    jest
      .spyOn(ChainUtils, 'updateDefaultChainOverride')
      .mockResolvedValue(undefined);

    customRender(
      <>
        <ChainSelectorPageComponent hideTitle />
        <TestModalHost />
      </>,
    );

    await user.click(await screen.findByTestId('btn-edit-default-chain-0x1'));
    await user.clear(screen.getByTestId('custom-evm-chain-name'));
    await user.type(screen.getByTestId('custom-evm-chain-name'), 'Edited ETH');
    await user.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(ChainUtils.updateDefaultChainOverride).toHaveBeenCalledWith(
        '0x1',
        expect.objectContaining({
          chainId: '0x1',
          name: 'Edited ETH',
          isCustom: false,
        }),
      );
    });
  });

  it('resets supported EVM chain overrides without deleting custom chains', async () => {
    const user = userEvent.setup();
    const overriddenSupportedChain = {
      ...supportedChain,
      name: 'Edited Ethereum',
      isDefaultOverride: true,
    };
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([
      overriddenSupportedChain,
    ]);
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([
      overriddenSupportedChain,
    ]);
    jest
      .spyOn(ChainUtils, 'resetDefaultChainOverride')
      .mockResolvedValue(undefined);

    customRender(
      <>
        <ChainSelectorPageComponent hideTitle />
        <TestModalHost />
      </>,
    );

    await user.click(await screen.findByTestId('btn-edit-default-chain-0x1'));
    await user.click(screen.getByTestId('custom-evm-chain-reset-default'));

    await waitFor(() => {
      expect(ChainUtils.resetDefaultChainOverride).toHaveBeenCalledWith('0x1');
    });
    expect(ChainUtils.removeCustomChain).not.toHaveBeenCalledWith('0x1');
  });
});
