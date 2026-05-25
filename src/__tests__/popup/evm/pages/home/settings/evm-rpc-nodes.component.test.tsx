import '@testing-library/jest-dom';
import { EvmRpcNodesComponent } from '@popup/evm/pages/home/settings/evm-advanced-settings/evm-rpc-nodes/evm-rpc-nodes.component';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  ChainType,
  EvmChain,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';

jest.mock('@common-ui/custom-select/custom-select.component', () => ({
  ComplexeCustomSelect: ({
    options,
    selectedItem,
    setSelectedItem,
  }: {
    options: { canDelete?: boolean; label: string; value: unknown }[];
    selectedItem: { label: string; value: unknown };
    setSelectedItem: (option: { label: string; value: unknown }) => void;
  }) => (
    <div data-testid="evm-rpc-select">
      {selectedItem.label}
      {options.map((option) => (
        <button
          data-can-delete={String(!!option.canDelete)}
          data-testid={`evm-rpc-option-${option.label}`}
          key={option.label}
          onClick={() => setSelectedItem(option)}>
          {option.label}
        </button>
      ))}
      {options
        .filter((option) => option.value === selectedItem.value)
        .map((option) => (
          <div data-testid="evm-rpc-selected-option" key={option.label}>
            {option.label}
          </div>
        ))}
    </div>
  ),
}));

jest.mock('@common-ui/checkbox/checkbox-panel/checkbox-panel.component', () => ({
  CheckboxPanelComponent: ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button data-testid="evm-rpc-auto-switch" onClick={onChange}>
      {checked ? 'checked' : 'unchecked'}
    </button>
  ),
}));

jest.mock('@common-ui/checkbox/checkbox/checkbox.component', () => ({
  __esModule: true,
  default: ({
    checked,
    dataTestId,
    onChange,
  }: {
    checked: boolean;
    dataTestId: string;
    onChange: (value: boolean) => void;
  }) => (
    <button data-testid={dataTestId} onClick={() => onChange(!checked)}>
      {checked ? 'checked' : 'unchecked'}
    </button>
  ),
}));

jest.mock('@common-ui/input/input.component', () => ({
  __esModule: true,
  default: ({
    dataTestId,
    onChange,
    value,
  }: {
    dataTestId: string;
    onChange: (value: string) => void;
    value: string;
  }) => (
    <input
      data-testid={dataTestId}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  ),
}));

jest.mock('@common-ui/separator/separator.component', () => ({
  Separator: () => <hr />,
}));

jest.mock('@common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ onClick }: { onClick?: () => void }) => (
    <button
      data-testid={onClick ? 'evm-rpc-save' : 'evm-rpc-icon'}
      onClick={onClick}
    />
  ),
}));

const defaultRpc: MultichainRpc = {
  url: 'https://default.rpc',
  isDefault: true,
};

const chain = {
  chainId: '0x1',
  name: 'Ethereum',
  type: ChainType.EVM,
  mainToken: 'ETH',
  logo: '',
  rpcs: [defaultRpc],
  defaultTransactionType: 'EIP_1559',
} as EvmChain;

describe('EvmRpcNodesComponent', () => {
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((key) => key);
    jest
      .spyOn(ChainUtils, 'getAllSetupChainsForType')
      .mockResolvedValue([chain]);
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue(defaultRpc);
    jest
      .spyOn(EvmRpcUtils, 'getRpcListForChain')
      .mockResolvedValue([defaultRpc]);
    jest.spyOn(EvmRpcUtils, 'getSwitchRpcAuto').mockResolvedValue(false);
    jest.spyOn(EvmRpcUtils, 'isValidRpcForChainId').mockResolvedValue(true);
    jest.spyOn(EvmRpcUtils, 'addCustomRpc').mockResolvedValue(undefined);
    jest.spyOn(EvmRpcUtils, 'setActiveRpc').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks the active RPC option when storage returns another object instance', async () => {
    const activeCustomRpc = {
      url: 'https://custom.rpc',
      isDefault: false,
    };
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue(activeCustomRpc);
    jest.spyOn(EvmRpcUtils, 'getRpcListForChain').mockResolvedValue([
      defaultRpc,
      {
        url: 'https://custom.rpc',
        isDefault: false,
      },
    ]);
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain,
    });

    render(
      <Provider store={store}>
        <EvmRpcNodesComponent />
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen
          .getAllByTestId('evm-rpc-selected-option')
          .map((item) => item.textContent),
      ).toContain('custom.rpc');
    });
  });

  it('allows deleting the previously active custom RPC after switching RPCs', async () => {
    const activeCustomRpc = {
      url: 'https://custom.rpc',
      isDefault: false,
    };
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue(activeCustomRpc);
    jest.spyOn(EvmRpcUtils, 'getRpcListForChain').mockResolvedValue([
      defaultRpc,
      activeCustomRpc,
    ]);
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain,
    });

    render(
      <Provider store={store}>
        <EvmRpcNodesComponent />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('evm-rpc-option-custom.rpc')).toHaveAttribute(
        'data-can-delete',
        'false',
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('evm-rpc-option-default.rpc'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('evm-rpc-option-custom.rpc')).toHaveAttribute(
        'data-can-delete',
        'true',
      );
    });
  });

  it('asks for confirmation before saving an HTTP RPC from the popup', async () => {
    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain,
    });
    const { container } = render(
      <Provider store={store}>
        <EvmRpcNodesComponent />
      </Provider>,
    );

    await waitFor(() => {
      expect(container.querySelector('.add-button')).not.toBeNull();
    });
    fireEvent.click(container.querySelector('.add-button')!);
    fireEvent.change(screen.getByTestId('input-rpc-node-uri'), {
      target: { value: 'http://localhost:8545' },
    });
    fireEvent.click(screen.getByTestId('evm-rpc-save'));

    await waitFor(() => {
      expect(store.getState().message.key).toBe('evm_add_http_rpc_warning');
    });
    expect(EvmRpcUtils.addCustomRpc).not.toHaveBeenCalled();

    const confirmHttpRpc = store.getState().message.confirmation
      ?.onConfirm as () => Promise<void>;
    await act(async () => {
      await confirmHttpRpc();
    });

    expect(EvmRpcUtils.isValidRpcForChainId).toHaveBeenCalledWith(
      'http://localhost:8545',
      '0x1',
      true,
    );
    expect(EvmRpcUtils.addCustomRpc).toHaveBeenCalledWith(
      { url: 'http://localhost:8545', isDefault: false },
      chain,
    );
  });

  it('does not save RPCs that do not match the selected chain', async () => {
    jest.spyOn(EvmRpcUtils, 'isValidRpcForChainId').mockResolvedValue(false);

    const store = getFakeStore({
      ...initialEmptyStateStore,
      chain,
    });
    const { container } = render(
      <Provider store={store}>
        <EvmRpcNodesComponent />
      </Provider>,
    );

    await waitFor(() => {
      expect(container.querySelector('.add-button')).not.toBeNull();
    });
    fireEvent.click(container.querySelector('.add-button')!);
    fireEvent.change(screen.getByTestId('input-rpc-node-uri'), {
      target: { value: 'https://wrong-chain.rpc' },
    });
    fireEvent.click(screen.getByTestId('evm-rpc-save'));

    await waitFor(() => {
      expect(store.getState().message.key).toBe(
        'evm_add_rpc_invalid_chain_error',
      );
    });
    expect(EvmRpcUtils.isValidRpcForChainId).toHaveBeenCalledWith(
      'https://wrong-chain.rpc',
      '0x1',
      true,
    );
    expect(EvmRpcUtils.addCustomRpc).not.toHaveBeenCalled();
  });
});
