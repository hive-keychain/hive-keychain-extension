import { WalletTokenHoldingsUtils } from 'src/common-ui/wallet-token-holdings/wallet-token-holdings.utils';

describe('WalletTokenHoldingsUtils', () => {
  it('parses token amounts that include commas or a symbol', () => {
    expect(WalletTokenHoldingsUtils.parseWalletTokenAmount('1,234.500 HIVE')).toBe(
      1234.5,
    );
    expect(WalletTokenHoldingsUtils.parseWalletTokenAmount(2)).toBe(2);
    expect(WalletTokenHoldingsUtils.parseWalletTokenAmount('')).toBeNaN();
  });

  it('formats a holding in USD and hides an unknown price', () => {
    expect(WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(4, 0.25)).toBe(
      '$1.00',
    );
    expect(
      WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(1234.5, 2),
    ).toBe('$2,469.00');
    expect(
      WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(0.0001, 1),
    ).toBe('~$0.00');
    expect(WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(0, 1)).toBe(
      '$0.00',
    );
    expect(
      WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(1, null),
    ).toBeUndefined();
    expect(
      WalletTokenHoldingsUtils.formatWalletTokenHoldingUsd(1, 0),
    ).toBeUndefined();
  });
});
