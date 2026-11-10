import React from 'react';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { I18nUtils } from 'src/utils/i18n.utils';
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { SendCalls } from 'src/dialog/evm/requests/send-calls/send-calls.component';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

let mockWarning = false;
let mockSecurityPending = false;
let mockGasRefreshing = false;
let mockTokenAmounts: number[] | undefined;
let mockNativeBalance: string | undefined;
const mockUseSendTransaction = jest.fn();
const mockIndividualConfirm = jest.fn();
const mockReview = jest.fn();
const buildFee = (gasPrice: string) => ({
  type: EvmTransactionType.LEGACY,
  gasLimit: new Decimal(21000),
  gasPriceInGwei: new Decimal(gasPrice).div(1e9),
  estimatedFeeInEth: new Decimal(
    ethers.formatEther(BigInt(gasPrice) * BigInt(21000)),
  ),
  maxFeeInEth: new Decimal(
    ethers.formatEther(BigInt(gasPrice) * BigInt(21000)),
  ),
  estimatedFeeUSD: new Decimal(0),
  maxFeeUSD: new Decimal(0),
  estimatedMaxDuration: new Decimal(0),
  icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
  name: 'custom',
});
jest.mock(
  'src/dialog/evm/requests/send-transaction/use-send-transaction',
  () => ({
    useSendTransaction: (request: any) => {
      mockUseSendTransaction(request);
      const callIndex = request.params[0].data === '0x02' ? 1 : 0;
      const [selectedFee, setSelectedFee] = React.useState(() => buildFee('1'));
      const [ignored, setIgnored] = React.useState(false);
      const hasWarning = () => mockWarning && !ignored;
      const warnings = () =>
        hasWarning()
          ? [{ level: 'medium', message: 'warn', ignored: false, type: 'BASE' }]
          : [];
      return {
        chain: { chainId: '0x1' },
        selectedAccount: { address: request.params[0].from },
        transactionData: request.params[0],
        tokenInfo: mockTokenAmounts
          ? {
              type: 'ERC20',
              contractAddress: address,
              symbol: 'TKN',
              decimals: 18,
            }
          : mockNativeBalance
            ? { type: 'NATIVE', symbol: 'ETH' }
            : undefined,
        transferAmount: mockTokenAmounts?.[callIndex],
        balanceInfo: mockTokenAmounts
          ? {
              mainBalance: {
                symbol: 'TKN',
                before: '100 TKN',
                rawBefore: '100',
                estimatedAfter: '0 TKN',
              },
            }
          : mockNativeBalance
            ? {
                mainBalance: {
                  symbol: 'ETH',
                  before: `${mockNativeBalance} ETH`,
                  rawBefore: mockNativeBalance,
                  estimatedAfter: `${mockNativeBalance} ETH`,
                },
              }
            : undefined,
        transactionHook: {
          fields: {},
          ready: true,
          loading: false,
          securityCheckPending: mockSecurityPending,
          hasBlockingError: false,
          hasWarning,
          getAllFieldsWithNotIgnoredWarnings: () =>
            hasWarning() ? [{ name: 'warning', warnings: warnings() }] : [],
          getAllNotIgnoredWarnings: warnings,
          getFieldsForWarningsPopup: () =>
            hasWarning() ? [{ name: 'warning', warnings: warnings() }] : [],
          openWarningsPopup: mockReview,
          closePopup: jest.fn(),
          ignorePopupWarnings: async () => setIgnored(true),
          handleOnConfirmClick: mockIndividualConfirm,
          setLoading: jest.fn(),
          setErrorMessage: jest.fn(),
          selectedFee,
          setSelectedFee,
        },
      };
    },
  }),
);
jest.mock(
  '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component',
  () => ({
    GasFeePanel: (props: any) => {
      React.useEffect(() => {
        void Promise.resolve().then(props.onInitialEstimationComplete);
      }, [props.transactionData]);
      React.useEffect(() => {
        props.onRefreshStateChange(mockGasRefreshing);
      }, [mockGasRefreshing]);
      return (
        <div data-testid="gas-fee-panel">
          <button onClick={() => props.onSelectFee(buildFee('2'))}>
            Edit gas fee
          </button>
          <button onClick={() => props.onSelectFee(buildFee('5'))}>
            Increase gas fee
          </button>
          <button onClick={() => props.onSelectFee(buildFee('0'))}>
            Invalid gas fee
          </button>
        </div>
      );
    },
  }),
);
jest.mock('src/common-ui/loading/loading.component', () => ({
  LoadingComponent: () => null,
}));
jest.mock('src/common-ui/custom-select/custom-select.component', () => ({
  ComplexeCustomSelect: ({ options, selectedItem, setSelectedItem }: any) => (
    <select
      aria-label="Account"
      value={selectedItem.value}
      onChange={(event) =>
        setSelectedItem(
          options.find((option: any) => option.value === event.target.value),
        )
      }>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
jest.mock(
  'src/dialog/evm/requests/transaction-warnings/transaction-warning.component',
  () => ({ EvmTransactionWarningsComponent: () => <div>Decoded call</div> }),
);
jest.mock(
  'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component',
  () => ({ ConfirmationPopup: () => null }),
);
jest.mock(
  'src/dialog/evm/requests/transaction-warnings/warning-multiple-popup.component',
  () => ({
    EvmMultipleWarningsPopup: ({ warningHooks, onClose }: any) => (
      <div role="dialog">
        <button
          onClick={async () => {
            await Promise.all(
              warningHooks.map((hook: any) => hook.ignorePopupWarnings()),
            );
            onClose();
          }}>
          Ignore all warnings
        </button>
      </div>
    ),
  }),
);
jest.mock(
  'src/common-ui/evm/evm-risk-warning/evm-risk-alert-banner.component',
  () => ({
    EvmRiskStaticAlert: () => null,
    EvmRiskAlertBanner: ({ onReviewClick }: any) => (
      <button onClick={onReviewClick}>Review warnings</button>
    ),
  }),
);
jest.mock('src/common-ui/button/button.component', () => ({
  __esModule: true,
  ButtonType: { ALTERNATIVE: 'alternative', IMPORTANT: 'important' },
  default: ({ label, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {label}
    </button>
  ),
}));
jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
    sendRuntimeMessageForResponse: (message: unknown) =>
      chrome.runtime.sendMessage(message),
  },
}));

const address = '0x' + '11'.repeat(20);
const request = {
  request_id: 1,
  method: EvmRequestMethod.WALLET_SEND_CALLS,
  params: [
    {
      version: '2.0.0',
      chainId: '0x1',
      atomicRequired: false,
      calls: [{ to: address }, { to: address }],
    },
  ],
};
const data = {
  command: DialogCommand.SEND_DIALOG_CONFIRM_EVM as const,
  request,
  tab: 2,
  dappInfo: {
    origin: 'https://example.com',
    domain: 'example.com',
    protocol: 'https:',
    logo: '',
  },
  accounts: [],
};
const preview = () => ({
  from: address,
  chainId: '0x1',
  symbol: 'ETH',
  chainName: 'Ethereum',
  value: '2',
  maxFee: '42000',
  balance: '1000000000000000000',
  calls: [
    { to: address, value: '0x1', gasLimit: '21000', type: 0, gasPrice: '1' },
    { to: address, value: '0x1', gasLimit: '21000', type: 0, gasPrice: '1' },
  ],
});
beforeEach(() => {
  jest.clearAllMocks();
  mockWarning = false;
  mockSecurityPending = false;
  mockGasRefreshing = false;
  mockTokenAmounts = undefined;
  mockNativeBalance = undefined;
  mockUseSendTransaction.mockClear();
  jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key) => key);
  jest.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue({
    success: true,
    result: { preview: preview(), addresses: [address] },
  });
});

it('shows every call, warns about partial execution, and uses standard reviews with gas panels and one approval for the selected fees', async () => {
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
  expect(screen.getAllByText('Decoded call')).toHaveLength(2);
  expect(screen.getAllByTestId('gas-fee-panel')).toHaveLength(2);
  expect(screen.getAllByText('dialog_confirm')).toHaveLength(1);
  expect(
    document.querySelectorAll('.evm-batch-call .operation-body .fields'),
  ).toHaveLength(2);
  expect(screen.getAllByText('evm_balance_change_title')).toHaveLength(1);
  expect(screen.getByText('evm_batch_non_atomic')).toBeInTheDocument();
  fireEvent.click(screen.getByText('dialog_confirm'));
  expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
    command: BackgroundCommand.ACCEPT_EVM_TRANSACTION,
    value: {
      request,
      tab: 2,
      ...data.dappInfo,
      extraData: {
        from: address,
        fees: [
          { type: 0, gasLimit: '21000', gasPrice: '1' },
          { type: 0, gasLimit: '21000', gasPrice: '1' },
        ],
      },
    },
  });
  expect(screen.queryByText('dialog_confirm')).toBeNull();
});

it('passes each call through the normal transaction decoder and combines token transfers in one balance panel', async () => {
  mockTokenAmounts = [30, 40];
  (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
    success: true,
    result: {
      preview: {
        ...preview(),
        calls: preview().calls.map((call, index) => ({
          ...call,
          data: index === 0 ? '0x01' : '0x02',
        })),
      },
      addresses: [address],
    },
  });
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByText('dialog_confirm')).not.toBeDisabled());
  expect(screen.getAllByText('evm_balance_change_title')).toHaveLength(1);
  expect(screen.getByText('30 TKN')).toBeInTheDocument();
  expect(mockUseSendTransaction.mock.calls.map(([call]) => [
    call.method,
    call.params[0].data,
  ])).toEqual(expect.arrayContaining([
    [EvmRequestMethod.SEND_TRANSACTION, '0x01'],
    [EvmRequestMethod.SEND_TRANSACTION, '0x02'],
  ]));
});

it('blocks approval when token transfers together exceed the balance', async () => {
  mockTokenAmounts = [70, 40];
  (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
    success: true,
    result: {
      preview: {
        ...preview(),
        calls: preview().calls.map((call, index) => ({
          ...call,
          data: index === 0 ? '0x01' : '0x02',
        })),
      },
      addresses: [address],
    },
  });
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await screen.findAllByTestId('gas-fee-panel');
  expect(screen.getAllByText('evm_balance_change_title')).toHaveLength(1);
  expect(screen.getByText('evm_insufficient_token_balance')).toBeInTheDocument();
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
});

it('uses the normal transaction balance refresh for the single batch balance panel', async () => {
  mockNativeBalance = '0.5';
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByText('dialog_confirm')).not.toBeDisabled());
  expect(screen.getAllByText('evm_balance_change_title')).toHaveLength(1);
  expect(screen.getByText('0.5 ETH')).toBeInTheDocument();
});

it('opens one warning review from Confirm and acknowledges all calls together', async () => {
  mockWarning = true;
  render(
    <SendCalls request={request} data={data} afterCancel={jest.fn()} />,
  );
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByText('dialog_confirm'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(mockReview).toHaveBeenCalledTimes(2);
  expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Ignore all warnings'));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.queryByText('Review warnings')).toBeNull();
  fireEvent.click(screen.getByText('dialog_confirm'));
  expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledTimes(1);
});

it('blocks confirmation while security checks run', async () => {
  mockSecurityPending = true;
  const view = render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await screen.findAllByTestId('gas-fee-panel');
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
  mockSecurityPending = false;
  view.rerender(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
});

it('does not permit confirmation after a failed preview', async () => {
  (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
    success: false,
    error: { code: -32000 },
  });
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await screen.findByText('evm_batch_prepare_failed');
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
  expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
});

it('keeps the reviewed page usable after two minutes without a refresh control', async () => {
  jest.useFakeTimers();
  try {
    render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(120001);
    });
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled();
    expect(screen.queryByText('evm_batch_refresh')).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});

it('updates combined cost and signs the selected fee without confirming individual transactions', async () => {
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await screen.findAllByTestId('gas-fee-panel');
  fireEvent.click(screen.getAllByText('Edit gas fee')[0]);
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
  expect(screen.getByText('0.000000000000063002 ETH')).toBeInTheDocument();
  fireEvent.click(screen.getByText('dialog_confirm'));
  expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      value: expect.objectContaining({
        extraData: {
          from: address,
          fees: [
            { type: 0, gasLimit: '21000', gasPrice: '2' },
            { type: 0, gasLimit: '21000', gasPrice: '1' },
          ],
        },
      }),
    }),
  );
  expect(mockIndividualConfirm).not.toHaveBeenCalled();
});

it('blocks approval when edited fees exceed the combined balance or are invalid', async () => {
  (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
    success: true,
    result: {
      preview: { ...preview(), balance: '100000' },
      addresses: [address],
    },
  });
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
  fireEvent.click(screen.getAllByText('Increase gas fee')[0]);
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
  expect(
    screen.getByText('evm_insufficient_token_balance'),
  ).toBeInTheDocument();
  fireEvent.click(screen.getAllByText('Invalid gas fee')[0]);
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
  fireEvent.click(screen.getAllByText('Edit gas fee')[0]);
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
});

it('blocks approval while gas fees refresh or the batch is inactive', async () => {
  mockGasRefreshing = true;
  const view = render(
    <SendCalls request={request} data={data} afterCancel={jest.fn()} />,
  );
  await screen.findAllByTestId('gas-fee-panel');
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
  mockGasRefreshing = false;
  view.rerender(
    <SendCalls
      request={request}
      data={data}
      afterCancel={jest.fn()}
      isActive={false}
    />,
  );
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
  view.rerender(
    <SendCalls request={request} data={data} afterCancel={jest.fn()} />,
  );
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
});

it('shows fee controls and an insufficient balance warning before approval', async () => {
  (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({
    success: true,
    result: {
      preview: { ...preview(), balance: '41000' },
      addresses: [address],
    },
  });
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await screen.findAllByTestId('gas-fee-panel');
  expect(screen.getAllByText('Decoded call')).toHaveLength(2);
  expect(
    screen.getByText('evm_insufficient_token_balance'),
  ).toBeInTheDocument();
  expect(screen.getByText('dialog_confirm')).toBeDisabled();
});

it('keeps the review available after a failed submission', async () => {
  const listener = jest.spyOn(chrome.runtime.onMessage, 'addListener');
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await waitFor(() =>
    expect(screen.getByText('dialog_confirm')).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByText('dialog_confirm'));
  act(() => {
    for (const [callback] of listener.mock.calls) {
      callback({
        command: DialogCommand.SEND_DIALOG_ERROR,
        msg: { request_id: 1 },
      });
    }
  });
  expect(screen.getByText('dialog_confirm')).not.toBeDisabled();
  listener.mockRestore();
});

it('refreshes the review when a different connected account is selected', async () => {
  const secondAddress = '0x' + '22'.repeat(20);
  const response = chrome.runtime.sendMessage as jest.Mock;
  response.mockImplementation(async ({ value }) => ({
    success: true,
    result: {
      preview: { ...preview(), from: value.from ?? address },
      addresses: [address, secondAddress],
    },
  }));
  render(<SendCalls request={request} data={data} afterCancel={jest.fn()} />);
  await screen.findByLabelText('Account');
  fireEvent.change(screen.getByLabelText('Account'), {
    target: { value: secondAddress },
  });
  await waitFor(() =>
    expect(response).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: expect.objectContaining({ from: secondAddress }),
      }),
    ),
  );
});
