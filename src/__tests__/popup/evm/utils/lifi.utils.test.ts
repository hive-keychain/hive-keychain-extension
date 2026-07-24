import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { TransactionResponse } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('LiFiUtils.getLiFiErrorMessage', () => {
  it('maps NoQuoteError (1002) to no available quotes', () => {
    expect(LiFiUtils.getLiFiErrorMessage({ errorCode: 1002 })).toBe(
      'evm_lifi_swap_error_no_available_quotes',
    );
  });

  it('maps ServerError (1006) to service unavailable', () => {
    expect(LiFiUtils.getLiFiErrorMessage({ errorCode: 1006 })).toBe(
      'evm_lifi_swap_error_service_unavailable',
    );
  });

  it('prefers tool error codes over API error codes', () => {
    expect(
      LiFiUtils.getLiFiErrorMessage({
        errorCode: 1006,
        errors: [{ code: 'AMOUNT_TOO_LOW' }],
      }),
    ).toBe('evm_lifi_swap_error_amount_too_low');
  });

  it('maps SlippageError (1007) to slippage message', () => {
    expect(LiFiUtils.getLiFiErrorMessage({ errorCode: 1007 })).toBe(
      'evm_lifi_swap_failed_slippage',
    );
  });
});

describe('LiFiUtils.isSameToken', () => {
  const usdcEth = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: 1,
  } as any;
  const ethChain = { id: 1 } as any;
  const allChains = { id: 0 } as any;

  it('returns true for same chain and address', () => {
    expect(
      LiFiUtils.isSameToken(ethChain, usdcEth, ethChain, {
        ...usdcEth,
        address: usdcEth.address.toLowerCase(),
      }),
    ).toBe(true);
  });

  it('returns false for different addresses', () => {
    expect(
      LiFiUtils.isSameToken(ethChain, usdcEth, ethChain, {
        ...usdcEth,
        address: '0x0000000000000000000000000000000000000001',
      }),
    ).toBe(false);
  });

  it('resolves chain from token when All chains is selected', () => {
    expect(LiFiUtils.isSameToken(allChains, usdcEth, allChains, usdcEth)).toBe(
      true,
    );
  });
});

describe('LiFiUtils.getTokenBalanceFromRawUnits', () => {
  it('formats ERC-20 balances with token decimals', () => {
    expect(LiFiUtils.getTokenBalanceFromRawUnits(1000000n, 6)).toEqual({
      formattedBalance: '1',
      balanceInteger: 1,
      balanceValue: '1.0',
    });
  });
});

describe('LiFiUtils.filterKnownTokensByQuery', () => {
  const tokens = [
    {
      address: '0x00000000000000000000000000000000000000AA',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    {
      address: '0x00000000000000000000000000000000000000BB',
      name: 'Tether USD',
      symbol: 'USDT',
    },
  ] as any[];

  it('matches known tokens by name, symbol, or contract address', () => {
    expect(LiFiUtils.filterKnownTokensByQuery(tokens, 'coin')).toEqual([
      tokens[0],
    ]);
    expect(LiFiUtils.filterKnownTokensByQuery(tokens, 'usdt')).toEqual([
      tokens[1],
    ]);
    expect(LiFiUtils.filterKnownTokensByQuery(tokens, '00aa')).toEqual([
      tokens[0],
    ]);
  });
});

describe('LiFiUtils pending swap history', () => {
  let storageMap: Map<LocalStorageKeyEnum, unknown>;

  const wallet = '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa';
  const normalizedWallet = wallet.toLowerCase();

  const lifiQuote = {
    action: {
      fromChainId: 1,
      fromAmount: '1250000',
      fromToken: {
        address: '0x00000000000000000000000000000000000000aa',
        chainId: 1,
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        coinKey: 'USDC',
        logoURI: 'https://example.com/usdc.png',
        priceUSD: '1',
      },
      toChainId: 137,
      toToken: {
        address: '0x00000000000000000000000000000000000000bb',
        chainId: 137,
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD',
        coinKey: 'USDT',
        logoURI: 'https://example.com/usdt.png',
        priceUSD: '1',
      },
    },
    estimate: {
      fromAmountUSD: '1.25',
      toAmount: 1.23,
      toAmountUSD: '1.23',
    },
  } as any;

  const transactionResponse = {
    hash: '0xABCDEF',
  } as TransactionResponse;

  beforeEach(() => {
    storageMap = new Map();
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) =>
        storageMap.get(key as LocalStorageKeyEnum),
      );
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        storageMap.set(key as LocalStorageKeyEnum, value);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds a pending placeholder from a Li.Fi quote and transaction response', () => {
    const item = LiFiUtils.buildPendingLiFiHistoryItem(
      lifiQuote,
      transactionResponse,
    );

    expect(item).toMatchObject({
      transactionId: '0xABCDEF',
      status: 'PENDING',
      sending: {
        txHash: '0xABCDEF',
        chainId: 1,
        amount: '1250000',
        amountUSD: '1.25',
        timestamp: 1710000000000,
        token: {
          symbol: 'USDC',
          decimals: 6,
        },
      },
      receiving: {
        chainId: 137,
        amount: '1230000',
        amountUSD: '1.23',
        timestamp: 1710000000000,
        token: {
          symbol: 'USDT',
          decimals: 6,
        },
      },
    });
  });

  it('stores pending placeholders under a normalized wallet address', async () => {
    await LiFiUtils.appendPendingLiFiSwapHistory(
      wallet,
      lifiQuote,
      transactionResponse,
    );

    const stored = storageMap.get(
      LocalStorageKeyEnum.EVM_LIFI_SWAP_HISTORY,
    ) as Record<string, unknown>;

    expect(Object.keys(stored)).toEqual([normalizedWallet]);
    expect(await LiFiUtils.getPendingLiFiSwapHistory(wallet)).toHaveLength(1);
  });

  it('dedupes pending placeholders by transaction hash', async () => {
    await LiFiUtils.appendPendingLiFiSwapHistory(
      wallet,
      lifiQuote,
      transactionResponse,
    );
    await LiFiUtils.appendPendingLiFiSwapHistory(
      wallet,
      lifiQuote,
      transactionResponse,
    );

    const pendingHistory = await LiFiUtils.getPendingLiFiSwapHistory(wallet);

    expect(pendingHistory).toHaveLength(1);
    expect(pendingHistory[0].transactionId).toBe('0xABCDEF');
  });

  it('keeps a pending placeholder when backend history does not include it', async () => {
    await LiFiUtils.appendPendingLiFiSwapHistory(
      wallet,
      lifiQuote,
      transactionResponse,
    );

    const backendHistory = [
      {
        transactionId: '0x1234',
        status: 'DONE',
        sending: { timestamp: 1700000000000 },
      },
    ] as any[];

    const mergedHistory = await LiFiUtils.mergeLiFiHistoryWithPendingSwaps(
      wallet,
      backendHistory,
    );

    expect(mergedHistory.map((item) => item.transactionId)).toEqual([
      '0xABCDEF',
      '0x1234',
    ]);
    expect(await LiFiUtils.getPendingLiFiSwapHistory(wallet)).toHaveLength(1);
  });

  it('drops a pending placeholder when backend history includes the same transaction', async () => {
    await LiFiUtils.appendPendingLiFiSwapHistory(
      wallet,
      lifiQuote,
      transactionResponse,
    );

    const backendHistory = [
      {
        transactionId: '0xabcdef',
        status: 'DONE',
        sending: { timestamp: 1720000000000 },
      },
    ] as any[];

    const mergedHistory = await LiFiUtils.mergeLiFiHistoryWithPendingSwaps(
      wallet,
      backendHistory,
    );

    expect(mergedHistory).toEqual(backendHistory);
    expect(await LiFiUtils.getPendingLiFiSwapHistory(wallet)).toHaveLength(0);
  });

  it('drops a pending placeholder when backend history includes the source transaction hash', async () => {
    await LiFiUtils.appendPendingLiFiSwapHistory(
      wallet,
      lifiQuote,
      transactionResponse,
    );

    const backendHistory = [
      {
        transactionId: 'lifi-generated-id',
        status: 'DONE',
        sending: {
          txHash: '0xabcdef',
          timestamp: 1720000000000,
        },
      },
    ] as any[];

    const mergedHistory = await LiFiUtils.mergeLiFiHistoryWithPendingSwaps(
      wallet,
      backendHistory,
    );

    expect(mergedHistory).toEqual(backendHistory);
    expect(await LiFiUtils.getPendingLiFiSwapHistory(wallet)).toHaveLength(0);
  });

  it('uses the Li.Fi quote transaction id when it is available', () => {
    const item = LiFiUtils.buildPendingLiFiHistoryItem(
      {
        ...lifiQuote,
        transactionId: 'lifi-quote-id',
      },
      transactionResponse,
    );

    expect(item.transactionId).toBe('lifi-quote-id');
    expect((item.sending as any).txHash).toBe('0xABCDEF');
  });
});
