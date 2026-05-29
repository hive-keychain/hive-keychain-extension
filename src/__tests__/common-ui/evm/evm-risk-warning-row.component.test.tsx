import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRiskWarningRow } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning-row.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="warning-icon" />,
}));

describe('EvmRiskWarningRow', () => {
  beforeEach(() => {
    global.chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  it('renders panel variant with severity title in modal layout', () => {
    render(
      <EvmRiskWarningRow
        variant="panel"
        warning={{
          level: EvmTransactionWarningLevel.HIGH,
          message: 'evm_transaction_warning_possible_scam',
          ignored: false,
          type: EvmTransactionWarningType.BASE,
        }}
      />,
    );

    const row = screen.getByTestId('evm-risk-warning-row');
    expect(row.className).toContain('evm-risk-warning-panel');
    expect(screen.getByText('evm_risk_severity_high')).toBeTruthy();
  });

  it('renders active warning as a tag', () => {
    render(
      <EvmRiskWarningRow
        warning={{
          level: EvmTransactionWarningLevel.HIGH,
          message: 'evm_transaction_warning_possible_scam',
          ignored: false,
          type: EvmTransactionWarningType.BASE,
        }}
      />,
    );

    expect(screen.getByTestId('evm-risk-warning-row')).toBeTruthy();
    expect(screen.getByTestId('evm-risk-warning-row').className).toContain(
      'evm-risk-tag',
    );
    expect(
      screen.getByText('evm_transaction_warning_possible_scam'),
    ).toBeTruthy();
    expect(screen.getByText('evm_risk_severity_high')).toBeTruthy();
  });

  it('shows reviewed label for acknowledged warnings', () => {
    render(
      <EvmRiskWarningRow
        warning={{
          level: EvmTransactionWarningLevel.MEDIUM,
          message: 'evm_test_warning',
          ignored: true,
          type: EvmTransactionWarningType.BASE,
        }}
      />,
    );

    expect(screen.getByText('evm_risk_warning_reviewed')).toBeTruthy();
    expect(screen.getByTestId('evm-risk-warning-row').className).toContain(
      'evm-risk-tag--acknowledged',
    );
  });

  it('calls onWarningClicked when tag is clicked', () => {
    const onWarningClicked = jest.fn();
    render(
      <EvmRiskWarningRow
        warning={{
          level: EvmTransactionWarningLevel.LOW,
          message: 'evm_test_warning',
          ignored: false,
          type: EvmTransactionWarningType.BASE,
        }}
        onWarningClicked={onWarningClicked}
      />,
    );

    fireEvent.click(screen.getByTestId('evm-risk-warning-row'));
    expect(onWarningClicked).toHaveBeenCalledTimes(1);
  });
});
