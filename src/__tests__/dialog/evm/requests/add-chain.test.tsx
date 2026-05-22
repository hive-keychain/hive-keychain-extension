import '@testing-library/jest-dom';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { AddChain } from '@dialog/evm/requests/add-chain/add-chain';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  BlockExplorerType,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CommunicationUtils } from 'src/utils/communication.utils';

const mockCustomEvmChainForm = jest.fn();
const mockCustomEvmChainFormSubmitError = jest.fn();
let mockSubmittedChain: EvmChain;

const mockTransactionHook = {
  setLoading: jest.fn(),
  setReady: jest.fn(),
  setFields: jest.fn(),
};

jest.mock('@dialog/evm/evm-operation/evm-operation', () => {
  const React = require('react');
  return {
    EvmOperation: ({ title, caption, onConfirm }: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'evm-operation' },
        React.createElement('div', {}, title),
        React.createElement('div', {}, caption),
        React.createElement(
          'button',
          {
            'data-testid': 'dialog-confirm',
            onClick: () => void onConfirm(),
          },
          'confirm',
        ),
      ),
  };
});

jest.mock('@dialog/evm/requests/transaction-warnings/transaction.hook', () => ({
  useTransactionHook: jest.fn(() => mockTransactionHook),
}));

jest.mock(
  '@dialog/evm/requests/transaction-warnings/transaction-warning.component',
  () => ({
    EvmTransactionWarningsComponent: () => null,
  }),
);

jest.mock(
  '@popup/evm/pages/home/settings/evm-custom-chains/custom-evm-chain-form.component',
  () => {
    const React = require('react');
    return {
      CustomEvmChainForm: (props: any) => {
        mockCustomEvmChainForm(props);
        return React.createElement(
          'div',
          { 'data-testid': 'custom-evm-chain-form' },
          React.createElement(
            'button',
            {
              'data-testid': 'custom-evm-chain-submit',
              onClick: async () => {
                try {
                  await props.onSubmit(mockSubmittedChain);
                } catch (error) {
                  mockCustomEvmChainFormSubmitError(error);
                }
              },
            },
            'submit',
          ),
        );
      },
    };
  },
);

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

const chain = {
  chainId: '0x539',
  name: 'Local Chain',
  type: ChainType.EVM,
  mainToken: 'ETH',
  logo: '',
  rpcs: [{ url: 'https://default.rpc', isDefault: true }],
  defaultTransactionType: 'EIP_1559',
} as EvmChain;

const request = {
  request_id: 99,
  method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
  params: [
    {
      chainId: '0x539',
      chainName: 'Local Chain',
      rpcUrls: ['https://rpc.example.com'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  ],
} as any;

const data = {
  tab: 7,
  dappInfo: {
    origin: 'https://example.app',
    domain: 'example.app',
  },
  accounts: [],
} as any;

describe('AddChain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmittedChain = {
      chainId: '0x539',
      name: 'Local Chain',
      type: ChainType.EVM,
      mainToken: 'ETH',
      logo: '',
      rpcs: [{ url: 'https://rpc.example.com', isDefault: true }],
      defaultTransactionType: EvmTransactionType.EIP_1559,
    } as EvmChain;
    global.chrome.i18n.getMessage = jest.fn(
      (key: string, params?: string[]) =>
        params?.length ? `${key}:${params.join(',')}` : key,
    );
    jest.spyOn(EvmRpcUtils, 'addCustomRpcsFromList').mockResolvedValue();
    jest.spyOn(EvmRpcUtils, 'setActiveRpc').mockResolvedValue();
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(chain);
    jest
      .spyOn(ChainUtils, 'getChainFromDefaultChains')
      .mockResolvedValue(undefined);
    jest.spyOn(ChainUtils, 'addChainToSetupChains').mockResolvedValue();
    jest.spyOn(ChainUtils, 'addCustomChain').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds custom RPCs without activating them when updating an existing chain', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([chain]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('evm_update_chain')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    await waitFor(() => {
      expect(EvmRpcUtils.addCustomRpcsFromList).toHaveBeenCalledWith(
        ['https://rpc.example.com'],
        chain,
      );
    });
    expect(EvmRpcUtils.setActiveRpc).not.toHaveBeenCalled();
    expect(ChainUtils.addCustomChain).not.toHaveBeenCalled();
    expect(mockCustomEvmChainForm).not.toHaveBeenCalled();
    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
      value: {
        requestId: 99,
        tab: 7,
        origin: 'https://example.app',
        result: true,
      },
    });
  });

  it('preloads dapp chain data into the custom chain form for a new chain', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    expect(mockCustomEvmChainForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialChain: {
          name: 'Local Chain',
          type: ChainType.EVM,
          mainToken: 'ETH',
          defaultTransactionType: EvmTransactionType.EIP_1559,
          logo: '',
          chainId: '0x539',
          rpcs: [{ url: 'https://rpc.example.com', isDefault: true }],
          blockExplorer: {
            url: '',
            type: BlockExplorerType.BLOCKSCOUT,
          },
          blockExplorerApi: { url: '', type: BlockExplorerType.BLOCKSCOUT },
        },
        submitLabel: 'dialog_confirm',
      }),
    );
  });

  it('renders the custom chain form when optional dapp metadata is missing', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    const requestWithoutMetadata = {
      ...request,
      params: [
        {
          chainId: '0x539',
          rpcUrls: ['https://rpc.example.com'],
        },
      ],
    };

    render(
      <AddChain
        request={requestWithoutMetadata}
        data={data}
        afterCancel={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    expect(mockCustomEvmChainForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialChain: expect.objectContaining({
          name: '',
          mainToken: '',
          chainId: '0x539',
          rpcs: [{ url: 'https://rpc.example.com', isDefault: true }],
        }),
      }),
    );
  });

  it('adds the chain and activates the first HTTPS RPC from the custom chain form', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(ChainUtils.addCustomChain).toHaveBeenCalledWith(mockSubmittedChain);
    });
    expect(EvmRpcUtils.addCustomRpcsFromList).toHaveBeenCalledWith(
      ['https://rpc.example.com'],
      mockSubmittedChain,
    );
    expect(EvmRpcUtils.setActiveRpc).toHaveBeenCalledWith(
      { url: 'https://rpc.example.com', isDefault: true },
      mockSubmittedChain,
    );
    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
      value: {
        requestId: 99,
        tab: 7,
        origin: 'https://example.app',
        result: true,
      },
    });
  });

  it('rejects non-HTTPS RPC edits from the custom chain form before saving', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    mockSubmittedChain = {
      ...mockSubmittedChain,
      rpcs: [{ url: 'http://rpc.example.com', isDefault: true }],
    };

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(mockCustomEvmChainFormSubmitError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'RPC URL must use HTTPS',
        }),
      );
    });
    expect(ChainUtils.addCustomChain).not.toHaveBeenCalled();
    expect(EvmRpcUtils.setActiveRpc).not.toHaveBeenCalled();
  });
});
