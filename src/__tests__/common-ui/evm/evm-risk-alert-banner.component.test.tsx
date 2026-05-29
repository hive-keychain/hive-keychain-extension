import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRiskAlertBanner } from 'src/common-ui/evm/evm-risk-warning/evm-risk-alert-banner.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="banner-icon" />,
}));

describe('EvmRiskAlertBanner', () => {
  beforeEach(() => {
    global.chrome.i18n.getMessage = jest.fn(
      (key: string, params?: string[]) =>
        params ? `${key}:${params.join(',')}` : key,
    );
  });

  it('renders nothing when warning count is zero', () => {
    const { container } = render(
      <EvmRiskAlertBanner
        warnings={[
          {
            level: EvmTransactionWarningLevel.HIGH,
            message: 'evm_test_warning',
            ignored: true,
            type: EvmTransactionWarningType.BASE,
          },
        ]}
        warningCount={0}
        onReviewClick={jest.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders clickable panel banner and opens review on click', () => {
    const onReviewClick = jest.fn();
    render(
      <EvmRiskAlertBanner
        warnings={[
          {
            level: EvmTransactionWarningLevel.MEDIUM,
            message: 'evm_test_warning',
            ignored: false,
            type: EvmTransactionWarningType.BASE,
          },
        ]}
        warningCount={1}
        onReviewClick={onReviewClick}
      />,
    );

    const banner = screen.getByTestId('evm-risk-alert-banner');
    expect(banner.tagName).toBe('BUTTON');
    expect(banner.className).toContain('evm-risk-alert--clickable');
    expect(banner.className).toContain('medium');
    expect(banner.className).toContain('evm-risk-alert--clickable');
    expect(
      screen.getByText('evm_risk_banner_message:1,evm_risk_severity_medium'),
    ).toBeTruthy();
    fireEvent.click(banner);
    expect(onReviewClick).toHaveBeenCalledTimes(1);
  });

  it('uses the highest severity across all warnings including critical duplicate', () => {
    render(
      <EvmRiskAlertBanner
        warnings={[
          {
            level: EvmTransactionWarningLevel.LOW,
            message: 'evm_transaction_receiver_not_whitelisted',
            ignored: false,
            type: EvmTransactionWarningType.BASE,
          },
          {
            level: EvmTransactionWarningLevel.HIGH,
            message: 'evm_warning_possible_duplicated_transaction',
            ignored: false,
            type: EvmTransactionWarningType.BASE,
          },
        ]}
        warningCount={2}
        onReviewClick={jest.fn()}
      />,
    );

    const banner = screen.getByTestId('evm-risk-alert-banner');
    expect(banner.className).toContain('high');
    expect(screen.getByText('evm_risk_severity_high')).toBeTruthy();
    expect(
      screen.getByText('evm_risk_banner_message:2,evm_risk_severity_high'),
    ).toBeTruthy();
  });
});
