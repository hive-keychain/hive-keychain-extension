import '@testing-library/jest-dom';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { AddChain } from '@dialog/evm/requests/add-chain/add-chain';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { ChainListOrgUtils } from '@popup/evm/utils/chain-list-org.utils';
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
const mockEvmOperationConfirmError = jest.fn();
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
            onClick: async () => {
              try {
                await onConfirm();
              } catch (error) {
                mockEvmOperationConfirmError(error);
              }
            },
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

const chainListChain = {
  name: 'Chainlist Chain',
  chain: 'chainlist',
  icon: 'chainlist',
  rpc: [
    { url: 'https://chainlist.rpc' },
    { url: 'https://chainlist-backup.rpc' },
  ],
  faucets: [],
  nativeCurrency: {
    name: 'Chainlist Ether',
    symbol: 'CLT',
    decimals: 18,
  },
  infoURL: 'https://chainlist.example',
  shortName: 'clt',
  chainId: 1337,
  networkId: 1337,
  explorers: [{ name: 'Explorer', url: 'https://explorer.chainlist' }],
  isTestnet: true,
};

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
    jest
      .spyOn(EvmRpcUtils, 'filterValidRpcsForChainId')
      .mockImplementation(async (rpcUrls) => rpcUrls);
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(chain);
    jest
      .spyOn(ChainUtils, 'getChainFromDefaultChains')
      .mockResolvedValue(undefined);
    jest.spyOn(ChainUtils, 'addChainToSetupChains').mockResolvedValue();
    jest.spyOn(ChainUtils, 'addCustomChain').mockResolvedValue();
    jest.spyOn(ChainListOrgUtils, 'findByChainId').mockResolvedValue(undefined);
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

  it('rejects an existing-chain add request when no dapp RPC matches the chainId', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([chain]);
    jest.spyOn(EvmRpcUtils, 'filterValidRpcsForChainId').mockResolvedValue([]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('evm_update_chain')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    await waitFor(() => {
      expect(mockEvmOperationConfirmError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'no_valid_rpc_for_chain_id' }),
      );
    });
    expect(EvmRpcUtils.addCustomRpcsFromList).not.toHaveBeenCalled();
    expect(EvmRpcUtils.setActiveRpc).not.toHaveBeenCalled();
    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
  });

  it('preloads Chainlist metadata into the custom chain form for a new Chainlist-backed chain', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest
      .spyOn(ChainListOrgUtils, 'findByChainId')
      .mockResolvedValue(chainListChain);
    jest
      .spyOn(EvmRpcUtils, 'filterValidRpcsForChainId')
      .mockImplementation(async (rpcUrls) => {
        if (rpcUrls.includes('https://chainlist-backup.rpc')) {
          return ['https://chainlist.rpc'];
        }
        return rpcUrls;
      });

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    expect(mockCustomEvmChainForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialChain: {
          name: 'Chainlist Chain',
          type: ChainType.EVM,
          mainToken: 'CLT',
          defaultTransactionType: EvmTransactionType.EIP_1559,
          logo: 'https://icons.llamao.fi/icons/chains/rsz_chainlist.jpg',
          chainId: '0x539',
          rpcs: [
            { url: 'https://chainlist.rpc', isDefault: true },
            { url: 'https://rpc.example.com', isDefault: false },
          ],
          blockExplorer: {
            url: 'https://explorer.chainlist',
            type: BlockExplorerType.BLOCKSCOUT,
          },
          blockExplorerApi: { url: '', type: BlockExplorerType.BLOCKSCOUT },
          testnet: true,
          isCustom: true,
          active: true,
          disableTokensAndHistoryAutoLoading: true,
          addTokensManually: true,
          manualDiscoverAvailable: false,
        },
        submitLabel: 'dialog_confirm',
      }),
    );
    expect(mockTransactionHook.setFields).toHaveBeenCalledWith({
      otherFields: expect.arrayContaining([
        expect.objectContaining({
          name: 'evm_chain_rpcs',
          value: 'https://chainlist.rpc, https://rpc.example.com',
        }),
      ]),
    });
  });

  it('uses Keychain canonical metadata when the requested chain exists in defaults', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest.spyOn(ChainUtils, 'getChainFromDefaultChains').mockResolvedValue({
      ...chain,
      name: 'Canonical Chain',
      mainToken: 'CAN',
    });

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('evm_add_chain')).toBeInTheDocument();
    });

    expect(mockTransactionHook.setFields).toHaveBeenCalledWith({
      otherFields: expect.arrayContaining([
        expect.objectContaining({
          name: 'evm_chain_name',
          value: 'Canonical Chain',
        }),
        expect.objectContaining({
          name: 'evm_chain_symbol',
          value: 'CAN',
        }),
      ]),
    });
    expect(mockCustomEvmChainForm).not.toHaveBeenCalled();
  });

  it('preloads dapp chain data into the custom chain form when Keychain and Chainlist have no match', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    expect(mockCustomEvmChainForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialChain: expect.objectContaining({
          name: 'Local Chain',
          mainToken: 'ETH',
          chainId: '0x539',
          rpcs: [{ url: 'https://rpc.example.com', isDefault: true }],
        }),
      }),
    );
  });

  it('preloads only validated dapp RPCs into the custom chain form', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest
      .spyOn(EvmRpcUtils, 'filterValidRpcsForChainId')
      .mockResolvedValue(['https://validated.rpc']);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    expect(mockCustomEvmChainForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialChain: expect.objectContaining({
          rpcs: [{ url: 'https://validated.rpc', isDefault: true }],
        }),
      }),
    );
    expect(mockTransactionHook.setFields).toHaveBeenCalledWith({
      otherFields: expect.arrayContaining([
        expect.objectContaining({
          name: 'evm_chain_rpcs',
          value: 'https://validated.rpc',
        }),
      ]),
    });
  });

  it('omits non-HTTPS dapp block explorer URLs from the custom chain form', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    const requestWithHttpExplorer = {
      ...request,
      params: [
        {
          ...request.params[0],
          blockExplorerUrls: ['http://explorer.example.com'],
        },
      ],
    } as any;

    render(
      <AddChain
        request={requestWithHttpExplorer}
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
          blockExplorer: {
            url: '',
            type: BlockExplorerType.BLOCKSCOUT,
          },
        }),
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

  it('adds a dapp-only chain and activates the first valid dapp RPC from the custom chain form', async () => {
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

  it('adds a Chainlist-backed chain and prefers a valid Chainlist RPC for activation', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest
      .spyOn(ChainListOrgUtils, 'findByChainId')
      .mockResolvedValue(chainListChain);
    jest
      .spyOn(EvmRpcUtils, 'filterValidRpcsForChainId')
      .mockImplementation(async (rpcUrls) => {
        const validRpcUrls: string[] = [];
        if (rpcUrls.includes('https://chainlist.rpc')) {
          validRpcUrls.push('https://chainlist.rpc');
        }
        if (rpcUrls.includes('https://chainlist-backup.rpc')) {
          validRpcUrls.push('https://chainlist-backup.rpc');
        }
        if (rpcUrls.includes('https://rpc.example.com')) {
          validRpcUrls.push('https://rpc.example.com');
        }
        return validRpcUrls;
      });

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    mockSubmittedChain = {
      ...(mockCustomEvmChainForm.mock.calls.at(-1)?.[0].initialChain as EvmChain),
      rpcs: [
        { url: 'https://chainlist.rpc', isDefault: true },
        { url: 'https://rpc.example.com', isDefault: false },
      ],
    } as EvmChain;

    fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(ChainUtils.addCustomChain).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Chainlist Chain',
          mainToken: 'CLT',
          rpcs: [
            { url: 'https://chainlist.rpc', isDefault: true },
            { url: 'https://rpc.example.com', isDefault: false },
          ],
        }),
      );
    });
    expect(EvmRpcUtils.addCustomRpcsFromList).toHaveBeenCalledWith(
      ['https://chainlist.rpc', 'https://rpc.example.com'],
      expect.objectContaining({ name: 'Chainlist Chain' }),
    );
    expect(EvmRpcUtils.setActiveRpc).toHaveBeenCalledWith(
      { url: 'https://chainlist.rpc', isDefault: true },
      expect.objectContaining({ name: 'Chainlist Chain' }),
    );
  });

  it('uses a valid dapp RPC for a Chainlist-backed chain when Chainlist RPCs do not validate', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest
      .spyOn(ChainListOrgUtils, 'findByChainId')
      .mockResolvedValue(chainListChain);
    jest
      .spyOn(EvmRpcUtils, 'filterValidRpcsForChainId')
      .mockImplementation(async (rpcUrls) => {
        if (rpcUrls.includes('https://chainlist.rpc')) {
          return [];
        }
        return ['https://rpc.example.com'];
      });

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    mockSubmittedChain = {
      ...(mockCustomEvmChainForm.mock.calls.at(-1)?.[0].initialChain as EvmChain),
      rpcs: [{ url: 'https://rpc.example.com', isDefault: true }],
    } as EvmChain;

    fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(EvmRpcUtils.setActiveRpc).toHaveBeenCalledWith(
        { url: 'https://rpc.example.com', isDefault: true },
        expect.objectContaining({ name: 'Chainlist Chain' }),
      );
    });
  });

  it('rejects a Chainlist-backed chain when no Chainlist or dapp RPC matches the chainId', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest
      .spyOn(ChainListOrgUtils, 'findByChainId')
      .mockResolvedValue(chainListChain);
    jest.spyOn(EvmRpcUtils, 'filterValidRpcsForChainId').mockResolvedValue([]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(mockCustomEvmChainFormSubmitError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'no_valid_rpc_for_chain_id' }),
      );
    });
    expect(ChainUtils.addCustomChain).not.toHaveBeenCalled();
    expect(EvmRpcUtils.setActiveRpc).not.toHaveBeenCalled();
  });

  it('rejects a dapp-only chain when no dapp RPC matches the chainId', async () => {
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([]);
    jest.spyOn(EvmRpcUtils, 'filterValidRpcsForChainId').mockResolvedValue([]);

    render(<AddChain request={request} data={data} afterCancel={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('custom-evm-chain-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('custom-evm-chain-submit'));

    await waitFor(() => {
      expect(mockCustomEvmChainFormSubmitError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'no_valid_rpc_for_chain_id' }),
      );
    });
    expect(ChainUtils.addCustomChain).not.toHaveBeenCalled();
    expect(EvmRpcUtils.setActiveRpc).not.toHaveBeenCalled();
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
