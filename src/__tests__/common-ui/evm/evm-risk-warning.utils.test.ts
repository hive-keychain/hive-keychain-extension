import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

describe('EvmRiskWarningUtils', () => {
  const activeWarning = {
    level: EvmTransactionWarningLevel.MEDIUM,
    message: 'evm_test_warning',
    ignored: false,
    type: EvmTransactionWarningType.BASE,
  };

  const ignoredWarning = {
    ...activeWarning,
    ignored: true,
  };

  it('maps severity levels to label and modal title keys', () => {
    expect(
      EvmRiskWarningUtils.getSeverityLabelKey(EvmTransactionWarningLevel.HIGH),
    ).toBe('evm_risk_severity_high');
    expect(
      EvmRiskWarningUtils.getModalTitleKey(EvmTransactionWarningLevel.LOW),
    ).toBe('evm_risk_modal_title_low');
  });

  it('uses info icon for low severity warnings', () => {
    expect(
      EvmRiskWarningUtils.getWarningIcon(EvmTransactionWarningLevel.LOW),
    ).toBe(SVGIcons.GLOBAL_INFO);
    expect(
      EvmRiskWarningUtils.getWarningIcon(EvmTransactionWarningLevel.HIGH),
    ).toBe(SVGIcons.GLOBAL_WARNING);
  });

  it('filters active warnings and resolves highest level', () => {
    expect(
      EvmRiskWarningUtils.getActiveWarnings([activeWarning, ignoredWarning]),
    ).toHaveLength(1);
    expect(
      EvmRiskWarningUtils.getHighestLevelFromWarnings([
        {
          ...activeWarning,
          level: EvmTransactionWarningLevel.LOW,
        },
        {
          ...activeWarning,
          level: EvmTransactionWarningLevel.HIGH,
        },
      ]),
    ).toBe(EvmTransactionWarningLevel.HIGH);
  });

  it('collects warnings from confirmation fields', () => {
    expect(
      EvmRiskWarningUtils.collectWarningsFromConfirmationFields([
        { warnings: [activeWarning] },
        { warnings: undefined },
        { warnings: [ignoredWarning] },
      ]),
    ).toEqual([activeWarning, ignoredWarning]);
  });

  it('prefers defaultLabel then ensName for whitelist nickname prefill', () => {
    expect(
      EvmRiskWarningUtils.getWhitelistDefaultLabel({
        ...activeWarning,
        type: EvmTransactionWarningType.WHITELIST_ADDRESS,
        extraData: { ensName: 'vitalik.eth' },
      }),
    ).toBe('vitalik.eth');

    expect(
      EvmRiskWarningUtils.getWhitelistDefaultLabel({
        ...activeWarning,
        type: EvmTransactionWarningType.WHITELIST_ADDRESS,
        extraData: {
          defaultLabel: 'My Token',
          ensName: 'vitalik.eth',
        },
      }),
    ).toBe('My Token');
  });

  it('counts fields with active warnings instead of raw warning entries', () => {
    expect(
      EvmRiskWarningUtils.countFieldsWithActiveWarnings([
        { warnings: [activeWarning, ignoredWarning] },
        { warnings: undefined },
        { warnings: [{ ...activeWarning, message: 'evm_other_warning' }] },
      ]),
    ).toBe(2);
  });
});
