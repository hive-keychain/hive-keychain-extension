import { EvmVerificationUtils } from '@popup/evm/utils/evm-verification.utils';

describe('EvmVerificationUtils helpers', () => {
  it('toGoPlusChainId normalizes hex chain ids', () => {
    expect(EvmVerificationUtils.toGoPlusChainId('0x1')).toBe('1');
    expect(EvmVerificationUtils.toGoPlusChainId('1')).toBe('1');
    expect(EvmVerificationUtils.toGoPlusChainId('')).toBeNull();
  });

  it('isGoPlusTruthy treats 1 and "1" as true', () => {
    expect(EvmVerificationUtils.isGoPlusTruthy('1')).toBe(true);
    expect(EvmVerificationUtils.isGoPlusTruthy(1)).toBe(true);
    expect(EvmVerificationUtils.isGoPlusTruthy('0')).toBe(false);
  });

  it('isAddressMalicious detects flagged address security fields', () => {
    expect(
      EvmVerificationUtils.isAddressMalicious({
        phishing_activities: '1',
      }),
    ).toBe(true);
    expect(
      EvmVerificationUtils.isAddressMalicious({
        phishing_activities: '0',
      }),
    ).toBe(false);
  });

  it('isHighTax returns true above 10 percent', () => {
    expect(EvmVerificationUtils.isHighTax('15')).toBe(true);
    expect(EvmVerificationUtils.isHighTax('5')).toBe(false);
  });
});

describe('fetchGoPlusVerificationData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty object when chain id is missing', async () => {
    const result = await EvmVerificationUtils.fetchGoPlusVerificationData({
      origin: 'https://app.example',
    });

    expect(result).toEqual({});
  });

  it('fetches phishing site data without authentication', async () => {
    jest.spyOn(EvmVerificationUtils, 'getPhishingSite').mockResolvedValue({
      code: 1,
      result: { phishing_site: 0 },
    });

    const result = await EvmVerificationUtils.fetchGoPlusVerificationData({
      chainId: '1',
      origin: 'https://app.example',
    });

    expect(result.phishingSite).toEqual({ phishing_site: 0 });
    expect(EvmVerificationUtils.getPhishingSite).toHaveBeenCalledWith(
      'https://app.example',
    );
  });
});
