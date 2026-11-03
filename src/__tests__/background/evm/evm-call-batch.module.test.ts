import { EvmCallBatchModule as Batches } from '@background/evm/evm-call-batch.module';
import { EvmTransactionSubmissionModule as Submissions } from '@background/evm/evm-transaction-submission.module';
import MkModule from '@background/hive/modules/mk.module';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { ethers } from 'ethers';

jest.mock('@background/hive/modules/mk.module', () => ({
  __esModule: true,
  default: { getMk: jest.fn() },
}));
jest.mock('@background/evm/evm-transaction-submission.module', () => ({
  EvmTransactionSubmissionModule: {
    reserve: jest.fn(),
    release: jest.fn(),
    commit: jest.fn(),
  },
}));
jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    getConnectedWallets: jest.fn(),
    getAllLocalAccounts: jest.fn(),
  },
}));
jest.mock('@popup/evm/utils/evm-signer.utils', () => ({
  EvmSignerUtils: { signTransaction: jest.fn() },
}));
jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: { getProvider: jest.fn() },
}));
jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getAllSetupChainsForType: jest.fn(async () => [
      {
        chainId: '0x1',
        name: 'Ethereum',
        mainToken: 'ETH',
        defaultTransactionType: '0x2',
      },
    ]),
  },
}));

const from = '0x' + '11'.repeat(20);
const second = '0x' + '22'.repeat(20);
const origin = 'https://example.com';
const locator = { requestId: 10, origin, tab: 1, frameId: 0 };
const request = {
  request_id: 10,
  method: EvmRequestMethod.WALLET_SEND_CALLS,
  chainId: '0x89',
  params: [
    {
      version: '2.0.0',
      chainId: '0x1',
      from,
      atomicRequired: false,
      calls: [
        { to: second, value: '0x1' },
        { to: from, data: '0x1234' },
      ],
    },
  ],
};
let provider: {
  estimateGas: jest.Mock;
  getFeeData: jest.Mock;
  getBalance: jest.Mock;
};
const approvedFees = (preview: Awaited<ReturnType<typeof Batches.prepare>>) =>
  preview.calls.map((call) => ({
    type: call.type,
    gasLimit: call.gasLimit,
    ...(call.type === 2
      ? {
          maxFeePerGas: call.maxFeePerGas,
          maxPriorityFeePerGas: call.maxPriorityFeePerGas,
        }
      : { gasPrice: call.gasPrice }),
  }));

beforeEach(() => {
  jest.resetAllMocks();
  // resetAllMocks would clear the chain fixture as well.
  const { ChainUtils } = require('@popup/multichain/utils/chain.utils');
  ChainUtils.getAllSetupChainsForType.mockResolvedValue([
    {
      chainId: '0x1',
      name: 'Ethereum',
      mainToken: 'ETH',
      defaultTransactionType: '0x2',
    },
  ]);
  (MkModule.getMk as jest.Mock).mockResolvedValue('unlocked');
  (EvmWalletUtils.getConnectedWallets as jest.Mock).mockResolvedValue([
    from,
    second,
  ]);
  (EvmWalletUtils.getAllLocalAccounts as jest.Mock).mockResolvedValue([
    { source: EvmAccountSource.IMPORTED, wallet: { address: from } },
    { source: EvmAccountSource.LEDGER, wallet: { address: second } },
  ]);
  provider = {
    estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
    getFeeData: jest.fn().mockResolvedValue({
      maxFeePerGas: BigInt(20),
      maxPriorityFeePerGas: BigInt(2),
      gasPrice: BigInt(10),
    }),
    getBalance: jest.fn().mockResolvedValue(ethers.parseEther('1')),
  };
  (EthersUtils.getProvider as jest.Mock).mockResolvedValue(provider);
  (Submissions.reserve as jest.Mock).mockResolvedValue({
    token: 'token',
    nonce: 7,
  });
  (EvmSignerUtils.signTransaction as jest.Mock).mockResolvedValue('signed');
});

it('advertises non-atomic support only for connected software accounts and requested setup chains', async () => {
  expect(await Batches.getCapabilities([from, ['0x1']], origin)).toEqual({
    '0x1': { atomic: { status: 'unsupported' } },
  });
  expect(await Batches.getCapabilities([second], origin)).toEqual({});
  expect(await Batches.getCapabilities([from, ['0x89']], origin)).toEqual({});
  (MkModule.getMk as jest.Mock).mockResolvedValue(undefined);
  expect(await Batches.getCapabilities([from], origin)).toEqual({});
});

it('previews all calls on the requested chain without signing or reserving nonces', async () => {
  const preview = await Batches.prepare(request, locator);
  expect(preview).toMatchObject({
    from,
    chainId: '0x1',
    maxFee: '1008000',
    value: '1',
  });
  expect(provider.estimateGas).toHaveBeenCalledTimes(2);
  expect(Submissions.reserve).not.toHaveBeenCalled();
  expect(EvmSignerUtils.signTransaction).not.toHaveBeenCalled();
});

it('rejects the entire preview when any call fails estimation, without a fallback gas limit', async () => {
  provider.estimateGas
    .mockResolvedValueOnce(BigInt(21000))
    .mockRejectedValueOnce(new Error('revert'));
  await expect(Batches.prepare(request, locator)).rejects.toMatchObject({
    code: -32000,
    message: expect.stringContaining('call 2'),
  });
  expect(EvmSignerUtils.signTransaction).not.toHaveBeenCalled();
});

it('shows the complete cost and pending balance even when the account cannot afford the initial fee', async () => {
  provider.getBalance.mockResolvedValue(BigInt(1008000));
  const preview = await Batches.prepare(request, locator);
  expect(preview).toMatchObject({
    balance: '1008000',
    maxFee: '1008000',
    value: '1',
  });
  await expect(
    Batches.submit(request, locator, preview.from, approvedFees(preview)),
  ).rejects.toMatchObject({ code: -32000 });
});

it('signs the approved calls with consecutive nonces and persists them before returning an ID', async () => {
  const preview = await Batches.prepare(request, locator);
  const result = await Batches.submit(
    request,
    locator,
    preview.from,
    approvedFees(preview),
  );
  expect(result.id).toMatch(/^0x[0-9a-f]{64}$/);
  expect(
    (EvmSignerUtils.signTransaction as jest.Mock).mock.calls.map(
      ([, transaction]) => [
        transaction.nonce,
        transaction.chainId,
        transaction.to,
      ],
    ),
  ).toEqual([
    [7, '0x1', second],
    [8, '0x1', from],
  ]);
  expect(Submissions.commit).toHaveBeenCalledWith('token', [
    'signed',
    'signed',
  ]);
  expect(Submissions.commit).toHaveBeenCalledTimes(1);
});

it('rejects an account different from the one required by the request', async () => {
  const preview = await Batches.prepare(request, locator);
  await expect(
    Batches.submit(request, locator, second, approvedFees(preview)),
  ).rejects.toMatchObject({ code: -32602 });
  expect(Submissions.reserve).not.toHaveBeenCalled();
});

it('requires reviewed fee selections for every call before signing', async () => {
  const preview = await Batches.prepare(request, locator);
  await expect(
    Batches.submit(request, locator, preview.from, undefined),
  ).rejects.toMatchObject({ code: -32602 });
  expect(EvmSignerUtils.signTransaction).not.toHaveBeenCalled();
});

it('rechecks connection permissions immediately before signing', async () => {
  const preview = await Batches.prepare(request, locator);
  (EvmWalletUtils.getConnectedWallets as jest.Mock).mockResolvedValue([]);
  await expect(
    Batches.submit(request, locator, preview.from, approvedFees(preview)),
  ).rejects.toMatchObject({ code: 4100 });
  expect(EvmSignerUtils.signTransaction).not.toHaveBeenCalled();
});

it('requires another review when gas increases beyond the approved bound', async () => {
  const preview = await Batches.prepare(request, locator);
  provider.estimateGas.mockResolvedValue(BigInt(100000));
  await expect(
    Batches.submit(request, locator, preview.from, approvedFees(preview)),
  ).rejects.toMatchObject({ code: -32002 });
  expect(Submissions.reserve).not.toHaveBeenCalled();
});

it('does not commit any calls when signing a later call fails', async () => {
  const preview = await Batches.prepare(request, locator);
  (EvmSignerUtils.signTransaction as jest.Mock)
    .mockResolvedValueOnce('signed')
    .mockRejectedValueOnce(new Error('signing failed'));
  await expect(
    Batches.submit(request, locator, preview.from, approvedFees(preview)),
  ).rejects.toThrow('signing failed');
  expect(Submissions.commit).not.toHaveBeenCalled();
  expect(Submissions.release).toHaveBeenCalledWith('token');
});

it('selects a connected software account when from is omitted and rejects Ledger requests', async () => {
  const noFrom = {
    ...request,
    params: [{ ...request.params[0], from: undefined }],
  };
  expect(await Batches.prepare(noFrom, locator)).toMatchObject({ from });
  await expect(Batches.prepare(noFrom, locator, second)).rejects.toMatchObject({
    code: 4100,
  });
});

it('rejects capability queries for an unconnected address', async () => {
  (EvmWalletUtils.getConnectedWallets as jest.Mock).mockResolvedValue([]);
  await expect(Batches.getCapabilities([from], origin)).rejects.toMatchObject({
    code: 4100,
  });
});

it('accepts an old review while rechecking the current balance and gas', async () => {
  const preview = await Batches.prepare(request, locator);
  const now = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 120001);
  try {
    await Batches.submit(request, locator, preview.from, approvedFees(preview));
    expect(provider.getBalance).toHaveBeenCalledTimes(2);
    expect(provider.estimateGas).toHaveBeenCalledTimes(4);
  } finally {
    now.mockRestore();
  }
});

it('signs the gas limit and EIP-1559 fees selected for each call', async () => {
  const preview = await Batches.prepare(request, locator);
  const fees = [
    {
      type: 2,
      gasLimit: '30000',
      maxFeePerGas: '40',
      maxPriorityFeePerGas: '3',
    },
    {
      type: 2,
      gasLimit: '28000',
      maxFeePerGas: '25',
      maxPriorityFeePerGas: '2',
    },
  ];
  await Batches.submit(request, locator, preview.from, fees);
  fees.forEach((fee, index) => {
    expect(EvmSignerUtils.signTransaction).toHaveBeenNthCalledWith(
      index + 1,
      expect.anything(),
      expect.objectContaining({
        ...fee,
        nonce: 7 + index,
        to: request.params[0].calls[index].to,
      }),
    );
    expect(provider.estimateGas).toHaveBeenCalledWith(
      expect.objectContaining(fee),
    );
  });
});

it('signs edited legacy gas prices', async () => {
  provider.getFeeData.mockResolvedValue({
    maxFeePerGas: null,
    maxPriorityFeePerGas: null,
    gasPrice: BigInt(10),
  });
  const preview = await Batches.prepare(request, locator);
  const fees = preview.calls.map(() => ({
    type: 0,
    gasLimit: '30000',
    gasPrice: '15',
  }));
  await Batches.submit(request, locator, preview.from, fees);
  expect(EvmSignerUtils.signTransaction).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining(fees[0]),
  );
});

it.each([
  ['missing calls', []],
  [
    'invalid gas limit',
    [
      {
        type: 2,
        gasLimit: '-1',
        maxFeePerGas: '20',
        maxPriorityFeePerGas: '2',
      },
    ],
  ],
  [
    'priority above maximum',
    [
      {
        type: 2,
        gasLimit: '30000',
        maxFeePerGas: '1',
        maxPriorityFeePerGas: '2',
      },
    ],
  ],
  [
    'zero gas price',
    [
      {
        type: 2,
        gasLimit: '30000',
        maxFeePerGas: '0',
        maxPriorityFeePerGas: '0',
      },
    ],
  ],
  [
    'unapproved transaction fields',
    [
      {
        type: 2,
        gasLimit: '30000',
        maxFeePerGas: '20',
        maxPriorityFeePerGas: '2',
        to: from,
      },
    ],
  ],
  [
    'unsupported transaction type',
    [{ type: 3, gasLimit: '30000', gasPrice: '20' }],
  ],
  [
    'oversized quantity',
    [
      {
        type: 2,
        gasLimit: '9'.repeat(79),
        maxFeePerGas: '20',
        maxPriorityFeePerGas: '2',
      },
    ],
  ],
])('rejects %s in approved fees before signing', async (_, values) => {
  const preview = await Batches.prepare(request, locator);
  const fees = values.length ? [values[0], values[0]] : values;
  await expect(
    Batches.submit(request, locator, preview.from, fees),
  ).rejects.toMatchObject({ code: -32602 });
  expect(Submissions.reserve).not.toHaveBeenCalled();
  expect(EvmSignerUtils.signTransaction).not.toHaveBeenCalled();
});

it('rechecks the combined balance using edited fees before signing', async () => {
  const preview = await Batches.prepare(request, locator);
  provider.getBalance.mockResolvedValue(BigInt(1500000));
  const fees = preview.calls.map(() => ({
    type: 2,
    gasLimit: '30000',
    maxFeePerGas: '40',
    maxPriorityFeePerGas: '3',
  }));
  await expect(
    Batches.submit(request, locator, preview.from, fees),
  ).rejects.toMatchObject({ code: -32000 });
  expect(Submissions.reserve).not.toHaveBeenCalled();
});

it('rejects a selected gas limit below the fresh estimate', async () => {
  const preview = await Batches.prepare(request, locator);
  const fees = preview.calls.map(() => ({
    type: 2,
    gasLimit: '20000',
    maxFeePerGas: '40',
    maxPriorityFeePerGas: '3',
  }));
  await expect(
    Batches.submit(request, locator, preview.from, fees),
  ).rejects.toMatchObject({ code: -32002 });
  expect(Submissions.reserve).not.toHaveBeenCalled();
});

it('accepts a reviewed legacy fee selection on a chain that supports EIP-1559', async () => {
  const preview = await Batches.prepare(request, locator);
  const fees = preview.calls.map(() => ({
    type: 0,
    gasLimit: '30000',
    gasPrice: '20',
  }));
  await Batches.submit(request, locator, preview.from, fees);
  expect(EvmSignerUtils.signTransaction).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining(fees[0]),
  );
  const signedTransaction = (EvmSignerUtils.signTransaction as jest.Mock).mock
    .calls[0][1];
  expect(signedTransaction.maxFeePerGas).toBeUndefined();
  expect(signedTransaction.maxPriorityFeePerGas).toBeUndefined();
});
