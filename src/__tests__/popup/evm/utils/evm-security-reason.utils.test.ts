import { EvmSecurityReasonUtils } from '@popup/evm/utils/evm-security-reason.utils';

describe('EvmSecurityReasonUtils', () => {
  it('maps fixed address reasons to dedicated message keys', () => {
    expect(EvmSecurityReasonUtils.getWarningForReason('mixer')).toEqual({
      message: 'evm_security_reason_mixer',
    });
    expect(
      EvmSecurityReasonUtils.getWarningForReason('phishing_activities'),
    ).toEqual({
      message: 'evm_security_reason_phishing_activities',
    });
  });

  it('maps domain prefixed reasons with message params', () => {
    expect(
      EvmSecurityReasonUtils.getWarningForReason('address_risk:high'),
    ).toEqual({
      message: 'evm_security_reason_address_risk',
      messageParams: ['high'],
    });
    expect(
      EvmSecurityReasonUtils.getWarningForReason('nft_risk:restricted_approval'),
    ).toEqual({
      message: 'evm_security_reason_nft_risk',
      messageParams: ['restricted_approval'],
    });
  });

  it('falls back to unknown reason message', () => {
    expect(EvmSecurityReasonUtils.getWarningForReason('custom_reason')).toEqual({
      message: 'evm_security_reason_unknown',
      messageParams: ['custom_reason'],
    });
  });

  it('dedupes and sorts reasons when building warnings', () => {
    const warnings = EvmSecurityReasonUtils.buildWarningsForSecurityReasons(
      ['mixer', 'mixer', 'phishing_activities'],
      true,
      'address',
    );

    expect(warnings).toEqual([
      { message: 'evm_security_reason_mixer' },
      { message: 'evm_security_reason_phishing_activities' },
    ]);
  });

  it('returns address fallback when malicious with empty reasons', () => {
    expect(
      EvmSecurityReasonUtils.buildWarningsForSecurityReasons([], true, 'address'),
    ).toEqual([{ message: 'evm_transaction_receiver_malicious' }]);
  });

  it('returns domain fallback when malicious with empty reasons', () => {
    expect(
      EvmSecurityReasonUtils.buildWarningsForSecurityReasons([], true, 'domain'),
    ).toEqual([{ message: 'evm_transaction_domain_phishing' }]);
  });

  it('returns no warnings when not malicious and no reasons', () => {
    expect(
      EvmSecurityReasonUtils.buildWarningsForSecurityReasons([], false, 'address'),
    ).toEqual([]);
  });
});
