import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  createGroupedSecurityWarning,
  getGroupedSecurityDetailReasons,
  hasGroupedSecurityDetails,
  isGroupedSecurityWarning,
} from '@popup/evm/utils/evm-grouped-security-warning.utils';

describe('EvmGroupedSecurityWarningUtils', () => {
  it('creates a grouped security warning with detail reasons', () => {
    const warning = createGroupedSecurityWarning(
      'evm_security_reason_rug_pull',
      [
        { message: 'evm_security_reason_rug_pull_approval_abuse' },
        { message: 'evm_security_reason_rug_pull_blacklist' },
      ],
      'rugPull',
    );

    expect(isGroupedSecurityWarning(warning)).toBe(true);
    expect(hasGroupedSecurityDetails(warning)).toBe(true);
    expect(getGroupedSecurityDetailReasons(warning)).toHaveLength(2);
    expect(warning.warningKey).toBe('rugPull');
    expect(warning.level).toBe(EvmTransactionWarningLevel.HIGH);
    expect(warning.type).toBe(EvmTransactionWarningType.GROUPED_SECURITY);
  });
});
