import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SendTransaction } from '@dialog/evm/requests/send-transaction/send-transaction';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { EthersUtils } from 'src/popup/evm/utils/ethers.utils';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

const mockParseTransaction = jest.fn();
const mockBalanceChangeCard = jest.fn(({ balanceInfo }) => (
  <div data-testid="balance-card">{JSON.stringify(balanceInfo)}</div>
));
const mockGasFeePanel = jest.fn((props: any) => {
  React.useEffect(() => {
    props.onInitialEstimationComplete?.();
  }, [props.transactionData]);
  return <div data-testid="gas-fee-panel" />;
});

const buildGasFeeEstimation = (
  estimatedFeeInEth: string,
): GasFeeEstimationBase => ({
  type: EvmTransactionType.EIP_1559,
  estimatedFeeInEth: new Decimal(estimatedFeeInEth),
  estimatedFeeUSD: new Decimal(0),
  maxFeeInEth: new Decimal('0.02'),
  maxFeeUSD: new Decimal(0),
  estimatedMaxDuration: new Decimal(0),
  gasLimit: new Decimal(21000),
  priorityFeeInGwei: new Decimal(1),
  maxFeePerGasInGwei: new Decimal(1),
  icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
  name: 'popup_html_evm_custom_gas_fee_custom',
});

jest.mock('src/dialog/evm/requests/transaction-warnings/transaction.hook', () => ({
  useTransactionHook: jest.fn(),
}));

jest.mock('src/dialog/evm/evm-operation/evm-operation', () => ({
  EvmOperation: ({ bottomPanel, confirmDisabled, hideConfirm, onConfirm }: any) => (
    <div data-testid="evm-operation">
      {bottomPanel}
      {!hideConfirm && (
        <button
          data-testid="dialog-confirm"
          disabled={confirmDisabled}
          onClick={onConfirm}
        />
      )}
    </div>
  ),
}));

jest.mock('src/common-ui/loading/loading.component', () => ({
  LoadingComponent: ({ hide, caption }: any) =>
    hide ? null : <div data-testid="loading">{caption}</div>,
}));

jest.mock('@dialog/components/balance-change-card/balance-change-card.component', () => ({
  BalanceChangeCard: (props: any) => mockBalanceChangeCard(props),
}));

jest.mock('@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component', () => ({
  GasFeePanel: (props: any) => mockGasFeePanel(props),
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
    buildInitialDomainField: jest.fn().mockReturnValue({
      name: 'dialog_evm_domain',
      type: 'string',
      value: 'app.example',
      warnings: [],
    }),
    hydrateDomainFieldWarnings: jest.fn().mockResolvedValue(undefined),
    getWalletAddressInput: jest
      .fn()
      .mockImplementation(
        async (
          address: string,
          _chainId: string,
          _transactionInfo: unknown,
          _accounts: unknown[],
          name = '',
        ) => ({
          address,
          name,
          type: 'wallet-address',
          value: '0x0000...00ff',
        }),
      ),
    handleOnConfirmClick: jest.fn(),
    hasWarning: jest.fn().mockReturnValue(false),
    initPendingTransactionWarning: jest.fn().mockResolvedValue(undefined),
    loading: false,
    ready: false,
    selectedFee: undefined,
    setErrorMessage: jest.fn(),
    setFields: jest.fn(),
    setLoading: jest.fn(),
    setReady: jest.fn(),
    securityCheckPending: false,
    setSecurityCheckPending: jest.fn(),
    setSelectedFee: jest.fn(),
    setUnableToReachBackend: jest.fn(),
  };

  const createDeferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
      resolve = res;
    });
    return { promise, resolve };
  };

  const buildSendTransactionProps = () => ({
    accounts: [
      {
        wallet: {
          address: '0x00000000000000000000000000000000000000ff',
          mnemonic: { phrase: 'test phrase' },
        },
      } as any,
    ],
    afterCancel: jest.fn(),
    data: { dappInfo: { domain: 'app.example' }, tab: 1 } as any,
    request: {
      chainId: '1',
      params: [
        {
          from: '0x00000000000000000000000000000000000000ff',
          gasLimit: 21000,
          maxFeePerGas: '1',
          maxPriorityFeePerGas: '1',
          to: '0x00000000000000000000000000000000000000ab',
          type: EvmTransactionType.EIP_1559,
          value: '1000000000000000000',
        },
      ],
      request_id: 1,
    } as any,
  });

  const lastSetFieldsPayload = () => {
    const calls = transactionHook.setFields.mock.calls;
    return calls[calls.length - 1][0];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockBalanceChangeCard.mockClear();
    transactionHook.fields = undefined;
    transactionHook.loading = false;
    transactionHook.ready = false;
    transactionHook.securityCheckPending = false;
    transactionHook.selectedFee = undefined;
    transactionHook.hasWarning.mockReturnValue(false);
    (useTransactionHook as jest.Mock).mockReturnValue(transactionHook);
    mockGasFeePanel.mockClear();
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
    jest.spyOn(EvmTokensUtils, 'getTokenBalance').mockResolvedValue({
      balance: '1000000',
      balanceInteger: 1,
      formattedBalance: '1',
      shortFormattedBalance: '1',
      tokenInfo: {
        symbol: 'USDC',
      },
    } as any);
    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue([
      { inputs: [], name: 'approve', outputs: [], type: 'function' },
    ]);
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(true);
    jest.spyOn(EvmAddressesUtils, 'isPotentialSpoofing').mockResolvedValue(
      null as any,
    );
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

  it('renders base transaction fields before contract enrichment resolves', async () => {
    const contractDeferred = createDeferred<any>();
    jest.spyOn(EvmLightNodeUtils, 'getContract').mockReturnValue(
      contractDeferred.promise,
    );

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

    const firstFields = transactionHook.setFields.mock.calls[0][0];
    expect(firstFields.operationName).toBe(
      'dialog_evm_decrypt_send_transaction_title',
    );
    expect(firstFields.otherFields.map((field: any) => field.name)).toEqual([
      'evm_chain',
      'dialog_evm_domain',
      'dialog_account',
      'evm_operation_smart_contract_address',
      'evm_transaction_data',
    ]);
    expect(transactionHook.setLoading).toHaveBeenCalledWith(false);
    expect(transactionHook.setSecurityCheckPending).toHaveBeenCalledWith(true);

    await act(async () => {
      contractDeferred.resolve({
        abi: [{ inputs: [], name: 'approve', outputs: [], type: 'function' }],
      });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(transactionHook.setSecurityCheckPending).toHaveBeenCalledWith(
        false,
      ),
    );
  });

  it('blocks confirm while transaction security checks are pending', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;
    transactionHook.securityCheckPending = true;

    render(<SendTransaction {...buildSendTransactionProps()} />);

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalled());
    act(() => {
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .onInitialEstimationComplete();
    });

    await waitFor(() =>
      expect((screen.getByTestId('dialog-confirm') as HTMLButtonElement).disabled)
        .toBe(true),
    );

    fireEvent.click(screen.getByTestId('dialog-confirm'));
    expect(transactionHook.handleOnConfirmClick).not.toHaveBeenCalled();
  });

  it('keeps the proxy address as the main contract field and shows the proxy target as info', async () => {
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

    const fields = lastSetFieldsPayload();
    const contractField = fields.otherFields.find(
      (field: any) => field.name === 'evm_operation_smart_contract_address',
    );
    expect(fields.otherFields.map((field: any) => field.name)).toEqual([
      'evm_chain',
      'dialog_evm_domain',
      'evm_operation_smart_contract_address',
      'dialog_account',
    ]);

    expect(contractField.information).toEqual([
      {
        message: 'evm_transaction_contract_use_proxy',
        messageParams: [proxyTarget],
      },
    ]);
    expect(contractField.value.type).toBe(EvmAddressComponent);
    expect(contractField.value.props.address).toBe(proxyAddress);
    expect(contractField.value.props.canCopy).toBe(true);
    expect(contractField.value.props.prefix.type).toBe(EvmTokenLogo);
    expect(contractField.value.props.prefix.props.tokenInfo.symbol).toBe('USDC');
  });

  it('adds a Ledger clear-signing fallback warning for Ledger token transactions', async () => {
    render(
      <SendTransaction
        accounts={[
          {
            address: '0x00000000000000000000000000000000000000ff',
            source: EvmAccountSource.LEDGER,
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

    const fields = lastSetFieldsPayload();
    const contractField = fields.otherFields.find(
      (field: any) => field.name === 'evm_operation_smart_contract_address',
    );

    expect(contractField.warnings).toContainEqual({
      ignored: false,
      level: 'medium',
      message: 'evm_ledger_clear_signing_fallback_warning',
      type: 'BASE',
    });
  });

  it('does not add a Ledger clear-signing fallback warning for software token transactions', async () => {
    render(
      <SendTransaction
        accounts={[
          {
            address: '0x00000000000000000000000000000000000000ff',
            source: EvmAccountSource.SEED,
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

    const fields = lastSetFieldsPayload();
    const contractField = fields.otherFields.find(
      (field: any) => field.name === 'evm_operation_smart_contract_address',
    );

    expect(contractField.warnings ?? []).not.toContainEqual(
      expect.objectContaining({
        message: 'evm_ledger_clear_signing_fallback_warning',
      }),
    );
  });

  it('does not show the Ledger confirmation caption during pre-confirmation loading', async () => {
    transactionHook.loading = true;

    render(
      <SendTransaction
        accounts={[
          {
            address: '0x00000000000000000000000000000000000000ff',
            source: EvmAccountSource.LEDGER,
          } as any,
        ]}
        afterCancel={jest.fn()}
        data={{ dappInfo: { domain: 'app.example' }, tab: 1 } as any}
        request={
          {
            chainId: '1',
            params: [
              {
                from: '0x00000000000000000000000000000000000000ff',
                gasLimit: 21000,
                maxFeePerGas: '1',
                maxPriorityFeePerGas: '1',
                to: '0x00000000000000000000000000000000000000ab',
                type: EvmTransactionType.EIP_1559,
                value: '1000000000000000000',
              },
            ],
            request_id: 1,
          } as any
        }
      />,
    );

    expect(screen.getByTestId('loading').textContent).toBe('');

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());
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

  it('omits From when it matches Account with different casing', async () => {
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
                from: '0x00000000000000000000000000000000000000FF',
                gasLimit: 21000,
                maxFeePerGas: '1',
                maxPriorityFeePerGas: '1',
                to: '0x00000000000000000000000000000000000000ab',
                type: EvmTransactionType.EIP_1559,
                value: '1000000000000000000',
              },
            ],
            request_id: 1,
          } as any
        }
      />,
    );

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());

    const fields = lastSetFieldsPayload();

    expect(fields.otherFields.map((field: any) => field.name)).toEqual([
      'evm_chain',
      'dialog_evm_domain',
      'dialog_account',
      'evm_operation_to',
    ]);
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

  it('falls back to bundled ABI decoding when light-node ABI cannot decode the transaction', async () => {
    const mintData =
      '0xa0712d680000000000000000000000000000000000000000000000000000000000000002';

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue([
      { inputs: [], name: 'approve', outputs: [], type: 'function' },
    ]);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([2n]);
    mockParseTransaction
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({
        args: {
          0: 2n,
          toArray: () => [2n],
        },
        fragment: { inputs: [{ name: 'quantity', type: 'uint256' }] },
        name: 'mint',
        signature: 'mint(uint256)',
        value: 0,
      });

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
                data: mintData,
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

    const fields = lastSetFieldsPayload();
    expect(fields.operationName).toBe('evm_operation_mint');
    expect(
      fields.otherFields.some((field: any) => field.name === 'evm_transaction_data'),
    ).toBe(false);
    expect(
      fields.otherFields.some(
        (field: any) => field.name === 'quantity' && field.value === '2',
      ),
    ).toBe(true);
  });

  it('displays native value paid for a decoded mint transaction', async () => {
    const mintData =
      '0xa0712d680000000000000000000000000000000000000000000000000000000000000002';

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue([
      { inputs: [], name: 'approve', outputs: [], type: 'function' },
    ]);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([2n]);
    mockParseTransaction
      .mockReturnValueOnce(null)
      .mockReturnValueOnce({
        args: {
          0: 2n,
          toArray: () => [2n],
        },
        fragment: { inputs: [{ name: 'quantity', type: 'uint256' }] },
        name: 'mint',
        signature: 'mint(uint256)',
        value: 0,
      });

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
                data: mintData,
                from: '0x00000000000000000000000000000000000000ff',
                gasLimit: 21000,
                maxFeePerGas: '1',
                maxPriorityFeePerGas: '1',
                to: proxyAddress,
                type: EvmTransactionType.EIP_1559,
                value: '25000000000000000',
              },
            ],
            request_id: 1,
          } as any
        }
      />,
    );

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());

    const fields = lastSetFieldsPayload();
    expect(fields.operationName).toBe('evm_operation_mint');
    expect(fields.mainTokenAmount).toMatchObject({
      name: 'evm_main_token_amount',
      value: '0.025 ETH',
    });
  });

  it('falls back to raw transaction data when both light-node and bundled ABIs cannot decode', async () => {
    const unknownData =
      '0xdeadbeef00000000000000000000000000000000000000000000000000000000000003e8';

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue([
      { inputs: [], name: 'approve', outputs: [], type: 'function' },
    ]);
    mockParseTransaction.mockReturnValue(null);

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
                data: unknownData,
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

    const fields = lastSetFieldsPayload();
    expect(fields.operationName).toBe('dialog_evm_decrypt_send_transaction_title');
    expect(
      fields.otherFields.some(
        (field: any) =>
          field.name === 'evm_transaction_data' && field.value === unknownData,
      ),
    ).toBe(true);
  });

  it('clears the loading state and falls back to bundled ABI decoding when the light node is unreachable', async () => {
    const mintData =
      '0xa0712d680000000000000000000000000000000000000000000000000000000000000002';

    const lightNodeError = new Error('Light node unreachable');
    jest
      .spyOn(EvmLightNodeUtils, 'getContract')
      .mockRejectedValue(lightNodeError);
    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockRejectedValue(lightNodeError);
    jest
      .spyOn(EvmTokensUtils, 'getTokenInfo')
      .mockRejectedValue(lightNodeError);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([2n]);
    mockParseTransaction.mockReturnValueOnce({
      args: {
        0: 2n,
        toArray: () => [2n],
      },
      fragment: { inputs: [{ name: 'quantity', type: 'uint256' }] },
      name: 'mint',
      signature: 'mint(uint256)',
      value: 0,
    });

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
                data: mintData,
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
    await waitFor(() =>
      expect(transactionHook.setLoading).toHaveBeenCalledWith(false),
    );
    expect(transactionHook.setReady).toHaveBeenCalledWith(true);

    const fields = lastSetFieldsPayload();
    expect(fields.operationName).toBe('evm_operation_mint');
    expect(
      fields.otherFields.some(
        (field: any) => field.name === 'quantity' && field.value === '2',
      ),
    ).toBe(true);
  });

  it('clears the loading state when light-node and bundled ABI both fail to decode', async () => {
    const unknownData =
      '0xdeadbeef00000000000000000000000000000000000000000000000000000000000003e8';

    const lightNodeError = new Error('Light node unreachable');
    jest
      .spyOn(EvmLightNodeUtils, 'getContract')
      .mockRejectedValue(lightNodeError);
    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockRejectedValue(lightNodeError);
    jest
      .spyOn(EvmTokensUtils, 'getTokenInfo')
      .mockRejectedValue(lightNodeError);
    mockParseTransaction.mockReturnValue(null);

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
                data: unknownData,
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
    await waitFor(() =>
      expect(transactionHook.setLoading).toHaveBeenCalledWith(false),
    );
    expect(transactionHook.setReady).toHaveBeenCalledWith(true);

    const fields = lastSetFieldsPayload();
    expect(fields.operationName).toBe(
      'dialog_evm_decrypt_send_transaction_title',
    );
    expect(
      fields.otherFields.some(
        (field: any) =>
          field.name === 'evm_transaction_data' && field.value === unknownData,
      ),
    ).toBe(true);
  });

  it('shows the native balance card for contract calls without token balance changes', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_approve',
    } as any;
    transactionHook.ready = true;
    transactionHook.selectedFee = buildGasFeeEstimation('0.01');

    const getBalanceInfoSpy = jest
      .spyOn(EvmTokensUtils, 'getBalanceInfo')
      .mockResolvedValue({
        mainBalance: {
          before: '1 ETH',
          estimatedAfter: '0.99  ETH',
        },
      } as any);

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

    await waitFor(() =>
      expect(getBalanceInfoSpy).toHaveBeenCalledWith(
        '0x00000000000000000000000000000000000000ff',
        expect.objectContaining({ chainId: '1' }),
        expect.objectContaining({ symbol: 'ETH' }),
        0,
        transactionHook.selectedFee,
        undefined,
      ),
    );
    await waitFor(() => expect(screen.getByTestId('balance-card')).toBeTruthy());
  });

  it('does not subtract ERC20 approve allowance from native balance', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_approve',
    } as any;
    transactionHook.ready = true;
    transactionHook.selectedFee = buildGasFeeEstimation('0.01');

    const spenderAddress = '0x00000000000000000000000000000000000000ab';
    const allowanceAmount = 1000000000n;
    const approveAbi = [
      {
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        type: 'function',
      },
    ];

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue(approveAbi);
    jest.spyOn(EvmLightNodeUtils, 'getContract').mockResolvedValue(null as any);
    jest
      .spyOn(EvmTransactionParserUtils, 'verifyTransactionInformation')
      .mockResolvedValue({} as any);
    jest
      .spyOn(EvmTransactionParserUtils, 'enrichVerificationForAddresses')
      .mockImplementation(async (verification) => verification);
    jest
      .spyOn(EvmTransactionParserUtils, 'getSmartContractWarningAndInfo')
      .mockResolvedValue({ information: [], warnings: [] });
    jest
      .spyOn(EvmTransactionParserUtils, 'getFieldWarnings')
      .mockResolvedValue([]);
    jest.spyOn(EvmAddressesUtils, 'validateTransferRecipient').mockResolvedValue({
      address: spenderAddress,
      valid: true,
    } as any);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([
      spenderAddress,
      allowanceAmount,
    ]);
    mockParseTransaction.mockReturnValue({
      args: {
        0: spenderAddress,
        1: allowanceAmount,
        toArray: () => [spenderAddress, allowanceAmount],
      },
      fragment: {
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
      },
      name: 'approve',
      signature: 'approve(address,uint256)',
      value: 0,
    });

    const getBalanceInfoSpy = jest
      .spyOn(EvmTokensUtils, 'getBalanceInfo')
      .mockResolvedValue({
        mainBalance: {
          before: '1 ETH',
          estimatedAfter: '0.99  ETH',
        },
      } as any);

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

    await waitFor(() =>
      expect(getBalanceInfoSpy).toHaveBeenCalledWith(
        '0x00000000000000000000000000000000000000ff',
        expect.objectContaining({ chainId: '1' }),
        expect.objectContaining({ symbol: 'ETH' }),
        0,
        transactionHook.selectedFee,
        undefined,
      ),
    );
    await waitFor(() => expect(screen.getByTestId('balance-card')).toBeTruthy());
    await waitFor(() =>
      expect(transactionHook.setFields.mock.calls.length).toBeGreaterThan(1),
    );

    await waitFor(() => {
      const fields = lastSetFieldsPayload();
      const amountField = fields.otherFields.find(
        (field: any) => field.name === 'evm_operation_amount',
      );
      expect(amountField).toEqual(
        expect.objectContaining({
          value: '1,000  USDC',
        }),
      );
    });
  });

  it('formats decoded NFT request addresses with the copyable address component', async () => {
    const senderAddress = '0x00000000000000000000000000000000000000ff';
    const fromAddress = '0x00000000000000000000000000000000000000ee';
    const toAddress = '0x00000000000000000000000000000000000000ab';
    const tokenId = 123n;
    const nftAbi = [
      {
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        type: 'function',
      },
    ];

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue(nftAbi);
    jest.spyOn(EvmLightNodeUtils, 'getContract').mockResolvedValue(null as any);
    jest
      .spyOn(EvmTransactionParserUtils, 'verifyTransactionInformation')
      .mockResolvedValue({} as any);
    jest
      .spyOn(EvmTransactionParserUtils, 'enrichVerificationForAddresses')
      .mockImplementation(async (verification) => verification);
    jest
      .spyOn(EvmTransactionParserUtils, 'getSmartContractWarningAndInfo')
      .mockResolvedValue({ information: [], warnings: [] });
    jest
      .spyOn(EvmTransactionParserUtils, 'getFieldWarnings')
      .mockResolvedValue([]);
    jest.spyOn(EvmAddressesUtils, 'validateTransferRecipient').mockResolvedValue({
      address: toAddress,
      valid: true,
    } as any);
    jest
      .spyOn(EvmTokensUtils, 'getTokenInfo')
      .mockResolvedValue({
        backgroundColor: '',
        chainId: '1',
        contractAddress: proxyAddress,
        logo: '',
        name: 'Test NFT',
        possibleSpam: false,
        priceUsd: 0,
        symbol: 'TNFT',
        type: EVMSmartContractType.ERC721,
        verifiedContract: true,
      } as any);
    jest
      .spyOn(EvmTokensUtils, 'getTokenType')
      .mockReturnValue(null as any);
    jest.spyOn(EvmNFTUtils, 'getMetadata').mockResolvedValue({
      image: '',
      name: 'Test NFT #123',
    } as any);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([
      fromAddress,
      toAddress,
      tokenId,
    ]);
    mockParseTransaction.mockReturnValue({
      args: {
        0: fromAddress,
        1: toAddress,
        2: tokenId,
        toArray: () => [fromAddress, toAddress, tokenId],
      },
      fragment: {
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
      },
      name: 'safeTransferFrom',
      signature: 'safeTransferFrom(address,address,uint256)',
      value: 0,
    });

    render(
      <SendTransaction
        accounts={[
          {
            wallet: {
              address: senderAddress,
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
                data: '0x42842e0e',
                from: senderAddress,
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

    await waitFor(() =>
      expect(transactionHook.setFields.mock.calls.length).toBeGreaterThan(1),
    );

    await waitFor(() => {
      const fields = lastSetFieldsPayload();
      const fromField = fields.otherFields.find(
        (field: any) => field.name === 'from',
      );
      const toField = fields.otherFields.find(
        (field: any) => field.name === 'to',
      );
      const contractField = fields.otherFields.find(
        (field: any) => field.name === 'evm_operation_smart_contract_address',
      );

      expect(contractField.value.type).toBe(EvmAddressComponent);
      expect(contractField.value.props.address).toBe(proxyAddress);
      expect(contractField.value.props.canCopy).toBe(true);
      expect(contractField.value.props.prefix.type).toBe(EvmTokenLogo);
      expect(contractField.value.props.prefix.props.tokenInfo.symbol).toBe(
        'TNFT',
      );
      expect(fromField.value.type).toBe(EvmAddressComponent);
      expect(fromField.value.props.address).toBe(fromAddress);
      expect(fromField.value.props.canCopy).toBe(true);
      expect(toField.value.type).toBe(EvmAddressComponent);
      expect(toField.value.props.address).toBe(toAddress);
      expect(toField.value.props.canCopy).toBe(true);
    });
  });

  it('labels ERC721 approve second argument as token ID when approve ABI is detected as ERC20', async () => {
    const approvedAddress = '0x00000000000000000000000000000000000000ab';
    const tokenId = 123n;
    const nftApproveAbi = [
      {
        inputs: [
          { name: 'approved', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        type: 'function',
      },
    ];

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue(nftApproveAbi);
    jest
      .spyOn(EvmTokensUtils, 'getTokenInfo')
      .mockResolvedValue({
        backgroundColor: '',
        chainId: '1',
        contractAddress: proxyAddress,
        logo: '',
        name: 'Test NFT',
        possibleSpam: false,
        priceUsd: 0,
        symbol: 'TNFT',
        type: EVMSmartContractType.ERC721,
        verifiedContract: true,
      } as any);
    jest
      .spyOn(EvmTokensUtils, 'getTokenType')
      .mockReturnValue(EVMSmartContractType.ERC20);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([
      approvedAddress,
      tokenId,
    ]);
    mockParseTransaction.mockReturnValue({
      args: {
        0: approvedAddress,
        1: tokenId,
        toArray: () => [approvedAddress, tokenId],
      },
      fragment: {
        inputs: [
          { name: 'approved', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
      },
      name: 'approve',
      signature: 'approve(address,uint256)',
      value: 0,
    });

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

    await waitFor(() => {
      const fields = lastSetFieldsPayload();

      const decodedArgumentFields = fields.otherFields.filter(
        (field: any) =>
          ![
            'evm_chain',
            'dialog_evm_domain',
            'evm_operation_smart_contract_address',
            'dialog_account',
          ].includes(field.name),
      );

      expect(decodedArgumentFields.map((field: any) => field.name)).toEqual([
        'evm_operation_to',
        'evm_nft_token_id',
      ]);
      expect(decodedArgumentFields[0].value.type).toBe(EvmAddressComponent);
      expect(decodedArgumentFields[0].value.props.address).toBe(approvedAddress);
      expect(decodedArgumentFields[1].value).toBe(tokenId.toString());
    });
  });

  it('labels NFT setApprovalForAll boolean as Approve All', async () => {
    const operatorAddress = '0x00000000000000000000000000000000000000ab';
    const nftApproveAllAbi = [
      {
        inputs: [
          { name: 'operator', type: 'address' },
          { name: 'approved', type: 'bool' },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        type: 'function',
      },
    ];

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue(nftApproveAllAbi);
    jest
      .spyOn(EvmTokensUtils, 'getTokenInfo')
      .mockResolvedValue({
        backgroundColor: '',
        chainId: '1',
        contractAddress: proxyAddress,
        logo: '',
        name: 'Test NFT',
        possibleSpam: false,
        priceUsd: 0,
        symbol: 'TNFT',
        type: EVMSmartContractType.ERC721,
        verifiedContract: true,
      } as any);
    jest
      .spyOn(EvmTokensUtils, 'getTokenType')
      .mockReturnValue(EVMSmartContractType.ERC721);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([
      operatorAddress,
      true,
    ]);
    mockParseTransaction.mockReturnValue({
      args: {
        0: operatorAddress,
        1: true,
        toArray: () => [operatorAddress, true],
      },
      fragment: {
        inputs: [
          { name: 'operator', type: 'address' },
          { name: 'approved', type: 'bool' },
        ],
      },
      name: 'SetApprovalForAll',
      signature: 'SetApprovalForAll(address,bool)',
      value: 0,
    });

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
                data: '0xa22cb465',
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

    const fields = lastSetFieldsPayload();

    expect(
      fields.otherFields.some((field: any) => field.name === 'approved'),
    ).toBe(false);
    expect(
      fields.otherFields.some(
        (field: any) =>
          field.name === 'evm_nft_approve_all' && field.value === 'true',
      ),
    ).toBe(true);
  });

  it('localizes numberOfTokens as Number of Tokens', async () => {
    const mintAbi = [
      {
        inputs: [{ name: 'numberOfTokens', type: 'uint256' }],
        name: 'mintNFTs',
        outputs: [],
        type: 'function',
      },
    ];

    jest.spyOn(EvmLightNodeUtils, 'getAbi').mockResolvedValue(mintAbi);
    jest
      .spyOn(EvmTokensUtils, 'getTokenInfo')
      .mockResolvedValue({
        backgroundColor: '',
        chainId: '1',
        contractAddress: proxyAddress,
        logo: '',
        name: 'Test NFT',
        possibleSpam: false,
        priceUsd: 0,
        symbol: 'TNFT',
        type: EVMSmartContractType.ERC721,
        verifiedContract: true,
      } as any);
    jest.spyOn(EvmTokensUtils, 'getTokenType').mockReturnValue(null as any);
    jest.spyOn(EvmTransactionParserUtils, 'parseArgs').mockReturnValue([2n]);
    mockParseTransaction.mockReturnValue({
      args: {
        0: 2n,
        toArray: () => [2n],
      },
      fragment: {
        inputs: [{ name: 'numberOfTokens', type: 'uint256' }],
      },
      name: 'mintNFTs',
      signature: 'mintNFTs(uint256)',
      value: 0,
    });

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
                data: '0x12345678',
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

    const fields = lastSetFieldsPayload();
    const numberOfTokensField = fields.otherFields.find(
      (field: any) => field.name === 'evm_nft_number_of_tokens',
    );

    expect(numberOfTokensField.value).toBe('2');
  });

  it('recomputes the balance card when a selected gas fee becomes available', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;

    const selectedGasFee = buildGasFeeEstimation('0.01');

    const getBalanceInfoSpy = jest
      .spyOn(EvmTokensUtils, 'getBalanceInfo')
      .mockResolvedValueOnce({
        mainBalance: {
          before: '1 ETH',
          estimatedAfter: '0.5  ETH',
        },
      } as any)
      .mockResolvedValueOnce({
        mainBalance: {
          before: '1 ETH',
          estimatedAfter: '0.49  ETH',
        },
      } as any);

    const props = {
      accounts: [
        {
          wallet: {
            address: '0x00000000000000000000000000000000000000ff',
            mnemonic: { phrase: 'test phrase' },
          },
        } as any,
      ],
      afterCancel: jest.fn(),
      data: { dappInfo: { domain: 'app.example' }, tab: 1 } as any,
      request: {
        chainId: '1',
        params: [
          {
            from: '0x00000000000000000000000000000000000000ff',
            gasLimit: 21000,
            maxFeePerGas: '1',
            maxPriorityFeePerGas: '1',
            to: '0x00000000000000000000000000000000000000ab',
            type: EvmTransactionType.EIP_1559,
            value: '1000000000000000000',
          },
        ],
        request_id: 1,
      } as any,
    };

    const { rerender } = render(<SendTransaction {...props} />);

    await waitFor(() =>
      expect(getBalanceInfoSpy).toHaveBeenCalledWith(
        '0x00000000000000000000000000000000000000ff',
        expect.objectContaining({ chainId: '1' }),
        expect.objectContaining({ symbol: 'ETH' }),
        expect.any(Number),
        undefined,
        undefined,
      ),
    );
    await waitFor(() => expect(screen.getByTestId('balance-card')).toBeTruthy());

    let lastBalanceCardCall =
      mockBalanceChangeCard.mock.calls[mockBalanceChangeCard.mock.calls.length - 1][0];
    expect(lastBalanceCardCall.balanceInfo.mainBalance.estimatedAfter).toBe(
      '0.5  ETH',
    );

    transactionHook.selectedFee = selectedGasFee;
    rerender(<SendTransaction {...props} />);

    await waitFor(() =>
      expect(getBalanceInfoSpy).toHaveBeenLastCalledWith(
        '0x00000000000000000000000000000000000000ff',
        expect.objectContaining({ chainId: '1' }),
        expect.objectContaining({ symbol: 'ETH' }),
        expect.any(Number),
        selectedGasFee,
        undefined,
      ),
    );

    await waitFor(() => {
      const latestCall =
        mockBalanceChangeCard.mock.calls[
          mockBalanceChangeCard.mock.calls.length - 1
        ][0];
      expect(latestCall.balanceInfo.mainBalance.estimatedAfter).toBe('0.49  ETH');
    });
  });

  it('requests a quiet gas refresh when an inactive queued transaction becomes active', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;

    const props = buildSendTransactionProps();
    const { rerender } = render(
      <SendTransaction {...props} isActive={false} activationKey="0" />,
    );

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalled());
    expect(
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .refreshKey,
    ).toBeUndefined();

    rerender(<SendTransaction {...props} isActive activationKey="1" />);

    await waitFor(() =>
      expect(
        mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
          .refreshKey,
      ).toBe(1),
    );
  });

  it('keeps the old balance visible with a tiny spinner during activation refresh', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;

    const refreshDeferred = createDeferred<any>();
    jest
      .spyOn(EvmTokensUtils, 'getBalanceInfo')
      .mockResolvedValueOnce({
        mainBalance: {
          before: '1 ETH',
          estimatedAfter: '0.5  ETH',
        },
      } as any)
      .mockReturnValueOnce(refreshDeferred.promise);

    const props = buildSendTransactionProps();
    const { rerender } = render(
      <SendTransaction {...props} isActive activationKey="0" />,
    );

    await waitFor(() => expect(screen.getByTestId('balance-card')).toBeTruthy());
    expect(screen.getByTestId('balance-card').textContent).toContain('0.5  ETH');

    rerender(<SendTransaction {...props} isActive={false} activationKey="0" />);
    rerender(<SendTransaction {...props} isActive activationKey="1" />);

    await waitFor(() =>
      expect(screen.getByTestId('balance-refresh-spinner')).toBeTruthy(),
    );
    expect(screen.getByTestId('balance-card').textContent).toContain('0.5  ETH');
    expect(screen.queryByTestId('loading')).toBeNull();

    await act(async () => {
      refreshDeferred.resolve({
        mainBalance: {
          before: '0.9 ETH',
          estimatedAfter: '0.4  ETH',
        },
      });
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('balance-card').textContent).toContain(
        '0.4  ETH',
      );
      expect(screen.queryByTestId('balance-refresh-spinner')).toBeNull();
    });
  });

  it('does not confirm while a quiet gas refresh is in progress', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;

    render(<SendTransaction {...buildSendTransactionProps()} />);

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalled());
    act(() => {
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .onInitialEstimationComplete();
    });
    await waitFor(() =>
      expect((screen.getByTestId('dialog-confirm') as HTMLButtonElement).disabled)
        .toBe(false),
    );

    act(() => {
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .onRefreshStateChange(true);
    });

    expect((screen.getByTestId('dialog-confirm') as HTMLButtonElement).disabled)
      .toBe(true);
    fireEvent.click(screen.getByTestId('dialog-confirm'));
    expect(transactionHook.handleOnConfirmClick).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loading')).toBeNull();

    act(() => {
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .onRefreshStateChange(false);
    });

    await waitFor(() =>
      expect((screen.getByTestId('dialog-confirm') as HTMLButtonElement).disabled)
        .toBe(false),
    );
  });

  it('opens custom gas panel and blocks confirm when selected fee is invalid', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;
    transactionHook.selectedFee = {
      type: EvmTransactionType.EIP_1559,
      estimatedFeeInEth: new Decimal(0),
      estimatedFeeUSD: new Decimal(0),
      maxFeeInEth: new Decimal(0),
      maxFeeUSD: new Decimal(0),
      estimatedMaxDuration: new Decimal(0),
      gasLimit: new Decimal(21000),
      priorityFeeInGwei: new Decimal(0),
      maxFeePerGasInGwei: new Decimal(0),
    } as any;

    render(<SendTransaction {...buildSendTransactionProps()} />);

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalled());
    expect(mockGasFeePanel).toHaveBeenLastCalledWith(
      expect.objectContaining({
        forceOpenGasFeePanelEvent: expect.anything(),
      }),
    );

    act(() => {
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .onInitialEstimationComplete();
    });
    await waitFor(() =>
      expect((screen.getByTestId('dialog-confirm') as HTMLButtonElement).disabled)
        .toBe(false),
    );

    const forceOpenEvent =
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .forceOpenGasFeePanelEvent;
    const forceOpenListener = jest.fn();
    forceOpenEvent.addListener('forceOpenCustomFeePanel', forceOpenListener);

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    expect(forceOpenListener).toHaveBeenCalled();
    expect(transactionHook.handleOnConfirmClick).not.toHaveBeenCalled();
  });

  it('hides confirm when balance is insufficient', async () => {
    transactionHook.fields = {
      operationName: 'evm_operation_transfer',
    } as any;
    transactionHook.ready = true;

    jest.spyOn(EvmTokensUtils, 'getBalanceInfo').mockResolvedValue({
      mainBalance: {
        before: '0.1 ETH',
        estimatedAfter: '-0.1 ETH',
        insufficientBalance: true,
      },
    } as any);

    render(<SendTransaction {...buildSendTransactionProps()} />);

    await waitFor(() => expect(mockGasFeePanel).toHaveBeenCalled());
    act(() => {
      mockGasFeePanel.mock.calls[mockGasFeePanel.mock.calls.length - 1][0]
        .onInitialEstimationComplete();
    });

    await waitFor(() =>
      expect(screen.queryByTestId('dialog-confirm')).toBeNull(),
    );
    expect(transactionHook.handleOnConfirmClick).not.toHaveBeenCalled();
  });
});
