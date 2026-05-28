import { LiFiUtils } from '@popup/evm/utils/lifi.utils';

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
