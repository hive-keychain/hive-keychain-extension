import { EvmActiveAccountInitUtils } from '@popup/evm/utils/evm-active-account-init.utils';

describe('EvmActiveAccountInitUtils', () => {
  it('skips restore once for the marked chain id', () => {
    EvmActiveAccountInitUtils.markPendingUserEvmWalletSelection('0x1');

    expect(
      EvmActiveAccountInitUtils.shouldSkipRestoreActiveEvmAccountOnChainChange(
        '0x1',
      ),
    ).toBe(true);
    expect(
      EvmActiveAccountInitUtils.shouldSkipRestoreActiveEvmAccountOnChainChange(
        '0x1',
      ),
    ).toBe(false);
  });

  it('matches chain ids case-insensitively', () => {
    EvmActiveAccountInitUtils.markPendingUserEvmWalletSelection('0xA');

    expect(
      EvmActiveAccountInitUtils.shouldSkipRestoreActiveEvmAccountOnChainChange(
        '0xa',
      ),
    ).toBe(true);
  });

  it('does not skip when chain id was not marked', () => {
    expect(
      EvmActiveAccountInitUtils.shouldSkipRestoreActiveEvmAccountOnChainChange(
        '0x1',
      ),
    ).toBe(false);
  });
});
