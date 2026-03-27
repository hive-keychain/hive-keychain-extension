import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { KeychainApi } from '@api/keychain';
import { SendTransaction } from '@dialog/evm/requests/send-transaction/send-transaction';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ethers } from 'ethers';
import { EthersUtils } from 'src/popup/evm/utils/ethers.utils';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

const mockParseTransaction = jest.fn();

jest.mock('src/dialog/evm/requests/transaction-warnings/transaction.hook', () => ({
  useTransactionHook: jest.fn(),
}));

jest.mock('src/dialog/evm/evm-operation/evm-operation', () => ({
  EvmOperation: () => <div data-testid="evm-operation" />,
}));

jest.mock('src/common-ui/loading/loading.component', () => ({
  LoadingComponent: () => <div data-testid="loading" />,
}));

jest.mock('@dialog/components/balance-change-card/balance-change-card.component', () => ({
  BalanceChangeCard: () => <div data-testid="balance-card" />,
}));

jest.mock('@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component', () => ({
  GasFeePanel: () => <div data-testid="gas-fee-panel" />,
}));

jest.mock('src/dialog/evm/requests/transaction-warnings/transaction-warning.component', () => ({
  EvmTransactionWarningsComponent: () => <div data-testid="tx-warnings" />,
}));

jest.mock('@popup/evm/pages/home/evm-token-logo/evm-token-logo.component', () => ({
  EvmTokenLogo: () => <div data-testid="token-logo" />,
}));

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    HDNodeWallet: {
      fromPhrase: jest.fn(() => ({
        address: '0x00000000000000000000000000000000000000ff',
        mnemonic: { phrase: 'test phrase' },
        signingKey: {},
      })),
    },
    Wallet: jest.fn().mockImplementation(() => ({})),
    ethers: {
      ...actual.ethers,
      Contract: jest.fn().mockImplementation(() => ({
        interface: {
          parseTransaction: mockParseTransaction,
        },
      })),
    },
  };
});

describe('send-transaction proxy tests:\n', () => {
  const proxyAddress = '0x00000000000000000000000000000000000000aa';
  const proxyTarget = '0x00000000000000000000000000000000000000bb';

  const transactionHook = {
    fields: undefined,
    getDomainWarnings: jest.fn().mockResolvedValue({
      name: 'domain',
      type: 'string',
      value: 'app.example',
    }),
    getWalletAddressInput: jest.fn().mockResolvedValue({
      name: 'dialog_account',
      type: 'wallet-address',
      value: '0x0000...00ff',
    }),
    handleOnConfirmClick: jest.fn(),
    initPendingTransactionWarning: jest.fn().mockResolvedValue(undefined),
    loading: false,
    ready: false,
    selectedFee: undefined,
    setErrorMessage: jest.fn(),
    setFields: jest.fn(),
    setLoading: jest.fn(),
    setReady: jest.fn(),
    setSelectedFee: jest.fn(),
    setUnableToReachBackend: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    (useTransactionHook as jest.Mock).mockReturnValue(transactionHook);
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue({
      chainId: '1',
      defaultTransactionType: EvmTransactionType.EIP_1559,
      mainToken: 'ETH',
      name: 'Ethereum',
    } as any);
    jest.spyOn(EthersUtils, 'getProvider').mockResolvedValue({} as any);
    jest.spyOn(EvmTokensUtils, 'getMainTokenInfo').mockResolvedValue({
      backgroundColor: '',
      categories: [],
      chainId: '1',
      coingeckoId: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      logo: '',
      name: 'Ether',
      priceUsd: 1,
      symbol: 'ETH',
      type: EVMSmartContractType.NATIVE,
    } as any);
    jest.spyOn(EvmTokensUtils, 'getTokenInfo').mockResolvedValue({
      backgroundColor: '',
      chainId: '1',
      contractAddress: proxyAddress,
      decimals: 6,
      isProxy: true,
      logo: '',
      name: 'USD Coin',
      possibleSpam: false,
      priceUsd: 1,
      proxyTarget,
      symbol: 'USDC',
      type: EVMSmartContractType.ERC20,
      validated: 0,
      verifiedContract: true,
    } as any);
    jest.spyOn(EvmTokensUtils, 'getTokenType').mockReturnValue(
      EVMSmartContractType.ERC20,
    );
    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue([
      { inputs: [], name: 'approve', outputs: [], type: 'function' },
    ]);
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      contract: {},
      domain: {},
      to: {},
    });
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(true);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([]);
    global.chrome.i18n.getMessage = jest.fn((key: string) => key);
    mockParseTransaction.mockReturnValue({
      args: {
        toArray: () => [],
      },
      fragment: { inputs: [] },
      name: 'approve',
      signature: 'approve()',
      value: 0,
    });
  });

  it('keeps the proxy address as the main contract field and shows the backend proxy target as info', async () => {
    render(
      <SendTransaction
        accounts={[
          {
            wallet: {
              address: '0x00000000000000000000000000000000000000ff',
              mnemonic: { phrase: 'test phrase' },
            },
          } as any,
        ]}
        afterCancel={jest.fn()}
        data={{ dappInfo: { domain: 'app.example' }, tab: 1 } as any}
        request={
          {
            chainId: '1',
            params: [
              {
                data: '0x095ea7b3',
                from: '0x00000000000000000000000000000000000000ff',
                gasLimit: 21000,
                maxFeePerGas: '1',
                maxPriorityFeePerGas: '1',
                to: proxyAddress,
                type: EvmTransactionType.EIP_1559,
                value: '0',
              },
            ],
            request_id: 1,
          } as any
        }
      />,
    );

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());

    const fields = transactionHook.setFields.mock.calls[0][0];
    const contractField = fields.otherFields.find(
      (field: any) => field.name === 'evm_operation_smart_contract_address',
    );

    expect(contractField.information).toEqual([
      {
        message: 'evm_transaction_contract_use_proxy',
        messageParams: [proxyTarget],
      },
    ]);
    expect(contractField.value.props.children[1].props.children).toBe(
      EvmFormatUtils.formatAddress(proxyAddress),
    );
  });

  it('does not request an abi for deployment transactions', async () => {
    render(
      <SendTransaction
        accounts={[
          {
            wallet: {
              address: '0x00000000000000000000000000000000000000ff',
              mnemonic: { phrase: 'test phrase' },
            },
          } as any,
        ]}
        afterCancel={jest.fn()}
        data={{ dappInfo: { domain: 'app.example' }, tab: 1 } as any}
        request={
          {
            chainId: '1',
            params: [
              {
                data: '0x60006000',
                from: '0x00000000000000000000000000000000000000ff',
                gasLimit: 21000,
                maxFeePerGas: '1',
                maxPriorityFeePerGas: '1',
                type: EvmTransactionType.EIP_1559,
                value: '0',
              },
            ],
            request_id: 1,
          } as any
        }
      />,
    );

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());

    expect(EvmLightNodeUtils.getAbi).not.toHaveBeenCalled();
  });

  it('normalizes serialized abi responses before decoding the transaction', async () => {
    const serializedAbi = JSON.stringify([
      { inputs: [], name: 'approve', outputs: [], type: 'function' },
    ]);

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue(serializedAbi);

    render(
      <SendTransaction
        accounts={[
          {
            wallet: {
              address: '0x00000000000000000000000000000000000000ff',
              mnemonic: { phrase: 'test phrase' },
            },
          } as any,
        ]}
        afterCancel={jest.fn()}
        data={{ dappInfo: { domain: 'app.example' }, tab: 1 } as any}
        request={
          {
            chainId: '1',
            params: [
              {
                data: '0x095ea7b3',
                from: '0x00000000000000000000000000000000000000ff',
                gasLimit: 21000,
                maxFeePerGas: '1',
                maxPriorityFeePerGas: '1',
                to: proxyAddress,
                type: EvmTransactionType.EIP_1559,
                value: '0',
              },
            ],
            request_id: 1,
          } as any
        }
      />,
    );

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());

    expect((ethers.Contract as jest.Mock).mock.calls[0][1]).toEqual(
      JSON.parse(serializedAbi),
    );
  });
});
