import { PendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import { PaidAccountCreationPaymentUtils } from 'src/popup/hive/utils/paid-account-creation-payment.utils';

describe('PaidAccountCreationPaymentUtils', () => {
  const chain = {
    name: 'Base',
    type: ChainType.EVM,
    logo: 'base.svg',
    chainId: '8453',
    mainToken: 'ETH',
    rpcs: [],
    defaultTransactionType: EvmTransactionType.EIP_1559,
  } as EvmChain;
  const payerAddress = '0x1111111111111111111111111111111111111111';
  const treasuryAddress = '0x2222222222222222222222222222222222222222';
  const baseRequest: PendingHiveAccountCreationRequest = {
    requestId: 'request-1',
    username: 'new-account',
    encryptedAccount: 'encrypted',
    paymentCurrency: 'EVM:8453:native',
    paymentAddress: treasuryAddress,
    amount: '0.001',
    paymentChainId: '8453',
    paymentTokenAddress: null,
    paymentPriceUsd: '3000',
    payerEvmAddress: payerAddress,
    paymentTokenSymbol: 'ETH',
    paymentTokenName: 'Ether',
    paymentTokenDecimals: 18,
    expiresAt: '2026-04-28T01:00:00.000Z',
    status: 'payment_pending',
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
  };

  it('builds native payment transaction data to the treasury address', () => {
    const tokenInfo = PaidAccountCreationPaymentUtils.buildPaymentTokenInfo(
      baseRequest,
      chain,
    )!;

    const transactionData =
      PaidAccountCreationPaymentUtils.buildPaymentTransactionData(
        baseRequest,
        payerAddress,
        tokenInfo,
        EvmTransactionType.EIP_1559,
      );

    expect(tokenInfo.type).toBe(EVMSmartContractType.NATIVE);
    expect(transactionData).toMatchObject({
      from: payerAddress,
      to: treasuryAddress,
      data: '',
      value: '0x38d7ea4c68000',
    });
  });

  it('only treats EVM account creation payments as payable with Keychain', () => {
    expect(
      PaidAccountCreationPaymentUtils.isEvmPaymentRequest(baseRequest),
    ).toBe(true);
    expect(
      PaidAccountCreationPaymentUtils.isEvmPaymentRequest({
        ...baseRequest,
        paymentCurrency: 'HIVE',
      }),
    ).toBe(false);
  });

  it('builds ERC20 transfer calldata to the treasury address', () => {
    const tokenAddress = '0x3333333333333333333333333333333333333333';
    const erc20Request = {
      ...baseRequest,
      paymentCurrency: `EVM:8453:${tokenAddress}`,
      paymentTokenAddress: tokenAddress,
      paymentTokenSymbol: 'USDC',
      paymentTokenName: 'USD Coin',
      paymentTokenDecimals: 6,
      amount: '3.25',
    };
    const tokenInfo = PaidAccountCreationPaymentUtils.buildPaymentTokenInfo(
      erc20Request,
      chain,
    )!;

    const transactionData =
      PaidAccountCreationPaymentUtils.buildPaymentTransactionData(
        erc20Request,
        payerAddress,
        tokenInfo,
        EvmTransactionType.EIP_1559,
      );
    const contractInterface = new ethers.Interface([
      'function transfer(address recipient, uint256 amount)',
    ]);
    const decoded = contractInterface.decodeFunctionData(
      'transfer',
      transactionData.data,
    );

    expect(tokenInfo.type).toBe(EVMSmartContractType.ERC20);
    expect(transactionData.to).toBe(tokenAddress);
    expect(transactionData.value).toBe('0x0');
    expect(decoded[0]).toBe(treasuryAddress);
    expect(decoded[1].toString()).toBe('3250000');
  });

  it('validates EVM and Hive payment transaction hashes', () => {
    const evmRequest = baseRequest;
    const hiveRequest = {
      ...baseRequest,
      paymentCurrency: 'HIVE',
      paymentChainId: null,
      payerEvmAddress: null,
    };

    expect(
      PaidAccountCreationPaymentUtils.isValidPaymentTxHash(
        evmRequest,
        `0x${'a'.repeat(64)}`,
      ),
    ).toBe(true);
    expect(
      PaidAccountCreationPaymentUtils.isValidPaymentTxHash(
        evmRequest,
        'a'.repeat(40),
      ),
    ).toBe(false);
    expect(
      PaidAccountCreationPaymentUtils.isValidPaymentTxHash(
        hiveRequest,
        'a'.repeat(40),
      ),
    ).toBe(true);
    expect(
      PaidAccountCreationPaymentUtils.isValidPaymentTxHash(
        hiveRequest,
        `0x${'a'.repeat(64)}`,
      ),
    ).toBe(false);
  });

  it('normalizes payment transaction hashes before validation', () => {
    expect(
      PaidAccountCreationPaymentUtils.normalizePaymentTxHash(
        `  ${'b'.repeat(40)}  `,
      ),
    ).toBe('b'.repeat(40));
  });

  it('returns human-readable chain and token labels', () => {
    expect(
      PaidAccountCreationPaymentUtils.getPaymentChainLabel(baseRequest, chain),
    ).toBe('Base');
    expect(
      PaidAccountCreationPaymentUtils.getPaymentTokenLabel(baseRequest, chain),
    ).toBe('Ether');

    const hiveRequest = {
      ...baseRequest,
      paymentCurrency: 'HIVE',
      paymentChainId: null,
      payerEvmAddress: null,
    };

    expect(
      PaidAccountCreationPaymentUtils.getPaymentChainLabel(hiveRequest),
    ).toBe('Hive');
    expect(
      PaidAccountCreationPaymentUtils.getPaymentTokenLabel(hiveRequest),
    ).toBe('HIVE');
  });
});
