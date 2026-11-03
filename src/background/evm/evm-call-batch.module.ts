import MkModule from '@background/hive/modules/mk.module';
import { EvmRequestLocator } from '@background/evm/requests/evm-request-handler';
import { EvmTransactionSubmissionModule } from '@background/evm/evm-transaction-submission.module';
import {
  EvmCallBatchPreview,
  EvmCallFees,
  EvmPreparedCall,
} from '@interfaces/evm-call-batch.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ethers, TransactionRequest } from 'ethers';
import { EvmCallBatchValidationUtils as Validation } from 'src/utils/evm/evm-call-batch-validation.utils';

const getEligibleAccounts = async (origin: string) => {
  const connected = (
    await EvmWalletUtils.getConnectedWallets(origin)
  ).map((address) => address.toLowerCase());
  if (!(await MkModule.getMk())) return [];
  return (await EvmWalletUtils.getAllLocalAccounts()).filter(
    (account) =>
      account.source !== EvmAccountSource.LEDGER &&
      connected.includes(account.wallet.address.toLowerCase()),
  );
};

const getCapabilities = async (params: unknown[], origin: string) => {
  Validation.validateGetCapabilities(params);
  const address = (params[0] as string).toLowerCase();
  const connected = await EvmWalletUtils.getConnectedWallets(origin);
  if (!connected.some((account) => account.toLowerCase() === address)) {
    throw Validation.error(4100, 'Account is not connected');
  }
  const eligible = await getEligibleAccounts(origin);
  if (
    !eligible.some(
      (account) => account.wallet.address.toLowerCase() === address,
    )
  )
    return {};
  const chains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
    ChainType.EVM,
  );
  const requested = params[1] as string[] | undefined;
  return Object.fromEntries(
    chains
      .filter(
        (chain) =>
          !requested?.length ||
          requested.some((id) => BigInt(id) === BigInt(chain.chainId)),
      )
      .map((chain) => [
        ethers.toQuantity(BigInt(chain.chainId)),
        { atomic: { status: 'unsupported' } },
      ]),
  );
};

const getSetupChain = async (chainId: string): Promise<EvmChain> => {
  const chains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
    ChainType.EVM,
  );
  const chain = chains.find(
    (entry) => BigInt(entry.chainId) === BigInt(chainId),
  );
  if (!chain) throw Validation.error(5710, 'Unsupported batch chain');
  return chain;
};

const toTransaction = (
  call: EvmPreparedCall,
  from: string,
  chainId: string,
): TransactionRequest => ({
  from,
  chainId,
  to: call.to,
  data: call.data ?? '0x',
  value: call.value ?? '0x0',
  type: call.type,
  gasLimit: call.gasLimit,
  gasPrice: call.gasPrice,
  maxFeePerGas: call.maxFeePerGas,
  maxPriorityFeePerGas: call.maxPriorityFeePerGas,
});

const prepare = async (
  request: EvmRequest,
  locator: EvmRequestLocator,
  selectedFrom?: string,
): Promise<EvmCallBatchPreview> => {
  const params = Validation.validateSendCalls(request.params);
  const accounts = await getEligibleAccounts(locator.origin!);
  const from = params.from ?? selectedFrom ?? accounts[0]?.wallet.address;
  if (
    !from ||
    !accounts.some(
      (account) => account.wallet.address.toLowerCase() === from.toLowerCase(),
    )
  ) {
    throw Validation.error(4100, 'A connected software account is required');
  }
  const chain = await getSetupChain(params.chainId);
  const provider = await EthersUtils.getProvider(chain);
  const fees = await provider.getFeeData();
  const use1559 =
    chain.defaultTransactionType === '0x2' &&
    fees.maxFeePerGas !== null &&
    fees.maxPriorityFeePerGas !== null;
  const minimumGasPrice = ethers.parseUnits(
    chain.customMinGasPriceInGwei ?? '0',
    'gwei',
  );
  const legacyGasPrice =
    fees.gasPrice && fees.gasPrice > minimumGasPrice
      ? fees.gasPrice
      : minimumGasPrice;
  if (!use1559 && !legacyGasPrice)
    throw Validation.error(-32000, 'Gas price unavailable');
  const feeFields = use1559
    ? {
        type: 2,
        maxFeePerGas: fees.maxFeePerGas!.toString(),
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas!.toString(),
      }
    : { type: 0, gasPrice: legacyGasPrice.toString() };
  const calls: EvmPreparedCall[] = [];
  let maxFee = BigInt(0);
  let value = BigInt(0);
  for (const [index, call] of params.calls.entries()) {
    let gas: bigint;
    try {
      gas = await provider.estimateGas({
        from,
        to: call.to,
        data: call.data ?? '0x',
        value: call.value ?? '0x0',
        ...feeFields,
      });
    } catch {
      throw Validation.error(
        -32000,
        `Cannot estimate call ${index +
          1}; calls that depend on earlier state changes are not supported`,
      );
    }
    // Never fall back to a guessed gas limit after a failed estimate.
    const gasLimit = (gas * BigInt(120) + BigInt(99)) / BigInt(100);
    calls.push({
      to: call.to,
      data: call.data,
      value: call.value,
      gasLimit: gasLimit.toString(),
      ...feeFields,
    });
    maxFee += gasLimit * BigInt(feeFields.maxFeePerGas ?? feeFields.gasPrice!);
    value += BigInt(call.value ?? 0);
  }
  const balance = await provider.getBalance(from, 'pending');
  const preview: EvmCallBatchPreview = {
    from,
    chainId: ethers.toQuantity(BigInt(params.chainId)),
    symbol: chain.mainToken,
    chainName: chain.name,
    calls,
    maxFee: maxFee.toString(),
    value: value.toString(),
    balance: balance.toString(),
  };
  return preview;
};

const validateFees = (value: unknown, preparedType: number): EvmCallFees => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Validation.error(-32602, 'Invalid approved call fees');
  const fee = value as Record<string, unknown>;
  const type = fee.type;
  if (type !== preparedType && !(preparedType === 2 && type === 0))
    throw Validation.error(-32602, 'Invalid approved call fees');
  const allowedFields =
    type === 2
      ? ['type', 'gasLimit', 'maxFeePerGas', 'maxPriorityFeePerGas']
      : ['type', 'gasLimit', 'gasPrice'];
  const isQuantity = (quantity: unknown): quantity is string =>
    typeof quantity === 'string' &&
    /^(0|[1-9][0-9]{0,77})$/.test(quantity) &&
    BigInt(quantity) <= ethers.MaxUint256;
  if (
    Object.keys(fee).some((key) => !allowedFields.includes(key)) ||
    !isQuantity(fee.gasLimit) ||
    BigInt(fee.gasLimit) === BigInt(0)
  )
    throw Validation.error(-32602, 'Invalid approved call fees');
  if (type === 2) {
    if (
      !isQuantity(fee.maxFeePerGas) ||
      BigInt(fee.maxFeePerGas) === BigInt(0) ||
      !isQuantity(fee.maxPriorityFeePerGas) ||
      BigInt(fee.maxPriorityFeePerGas) > BigInt(fee.maxFeePerGas)
    )
      throw Validation.error(-32602, 'Invalid approved call fees');
    return {
      type,
      gasLimit: fee.gasLimit,
      maxFeePerGas: fee.maxFeePerGas,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    };
  }
  if (!isQuantity(fee.gasPrice) || BigInt(fee.gasPrice) === BigInt(0))
    throw Validation.error(-32602, 'Invalid approved call fees');
  return { type, gasLimit: fee.gasLimit, gasPrice: fee.gasPrice };
};

const submit = async (
  request: EvmRequest,
  locator: EvmRequestLocator,
  selectedFrom: unknown,
  selectedFees: unknown,
) => {
  const params = Validation.validateSendCalls(request.params);
  if (
    typeof selectedFrom !== 'string' ||
    !ethers.isAddress(selectedFrom) ||
    (params.from && params.from.toLowerCase() !== selectedFrom.toLowerCase())
  )
    throw Validation.error(-32602, 'Invalid approved account');
  if (
    !Array.isArray(selectedFees) ||
    selectedFees.length !== params.calls.length
  )
    throw Validation.error(-32602, 'Fees are required for every approved call');
  const chain = await getSetupChain(params.chainId);
  const preparedType = chain.defaultTransactionType === '0x2' ? 2 : 0;
  const calls: EvmPreparedCall[] = params.calls.map((call, index) => ({
    to: call.to,
    data: call.data,
    value: call.value,
    ...validateFees(selectedFees[index], preparedType),
  }));
  const maxFee = calls.reduce(
    (total, call) =>
      total +
      BigInt(call.gasLimit) * BigInt(call.maxFeePerGas ?? call.gasPrice!),
    BigInt(0),
  );
  const account = (await getEligibleAccounts(locator.origin!)).find(
    (candidate) =>
      candidate.wallet.address.toLowerCase() === selectedFrom.toLowerCase(),
  );
  if (!account)
    throw Validation.error(4100, 'Account is no longer connected or unlocked');
  const provider = await EthersUtils.getProvider(chain);
  const totalValue = params.calls.reduce(
    (total, call) => total + BigInt(call.value ?? 0),
    BigInt(0),
  );
  if (
    (await provider.getBalance(selectedFrom, 'pending')) < totalValue + maxFee
  ) {
    throw Validation.error(
      -32000,
      'Insufficient balance for the approved batch',
    );
  }
  // State may have changed during review. Never silently increase the approved gas/fee bounds.
  for (const call of calls) {
    const transaction = toTransaction(call, selectedFrom, params.chainId);
    const gas = await provider.estimateGas(transaction);
    if (gas > BigInt(call.gasLimit))
      throw Validation.error(
        -32002,
        'Gas estimate changed; review the batch again',
      );
  }
  const id = params.id ?? ethers.hexlify(ethers.randomBytes(32));
  const reservation = await EvmTransactionSubmissionModule.reserve(
    selectedFrom,
    params.chainId,
    calls.length,
    undefined,
    { id, origin: locator.origin! },
  );
  try {
    const raw: string[] = [];
    for (const [index, call] of calls.entries()) {
      raw.push(
        await EvmSignerUtils.signTransaction(account.wallet, {
          ...toTransaction(call, selectedFrom, params.chainId),
          nonce: reservation.nonce + index,
        }),
      );
    }
    await EvmTransactionSubmissionModule.commit(reservation.token, raw);
  } catch (error) {
    await EvmTransactionSubmissionModule.release(reservation.token);
    throw error;
  }
  return { id };
};

export const EvmCallBatchModule = {
  getCapabilities,
  getEligibleAccounts,
  prepare,
  submit,
};
