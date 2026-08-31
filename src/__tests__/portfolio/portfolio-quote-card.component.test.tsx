import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioQuoteCard } from 'src/portfolio/ui/portfolio-quote-card.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('react-svg', () => ({
  ReactSVG: ({
    afterInjection,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { afterInjection?: unknown }) => (
    <div {...props} />
  ),
}));

const createQuote = (overrides: Partial<PortfolioQuote> = {}): PortfolioQuote => ({
  quoteId: 'moonpay:card',
  provider: 'moonpay',
  providerName: 'MoonPay',
  providerLogoUrl: 'https://example.com/moonpay.png',
  category: 'buy',
  routeType: null,
  fromAsset: null,
  toAsset: null,
  fromAmount: '100',
  estimatedToAmount: '0.05',
  comparableValue: '0.05',
  providerFee: null,
  networkFeeEstimate: null,
  priceImpact: null,
  warnings: [],
  expiresAt: null,
  redirectUrl: null,
  requiresRedirect: true,
  executionType: 'redirect',
  routeMetadata: null,
  approval: null,
  transaction: null,
  paymentMethod: null,
  kyc: 'never',
  ...overrides,
});

describe('PortfolioQuoteCard', () => {
  beforeEach(() => {
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key: string) => {
      if (key === 'portfolio_payment_method_credit_debit_card') {
        return 'Credit / Debit Card';
      }
      if (key === 'portfolio_payment_method_apple_pay') {
        return 'Apple Pay';
      }
      if (key === 'portfolio_quote_payment_method') {
        return 'Payment method';
      }
      if (key === 'portfolio_quote_kyc_never') {
        return 'No KYC';
      }
      if (key === 'portfolio_quote_kyc_possible') {
        return 'Possible KYC';
      }
      if (key === 'portfolio_quote_kyc_possible_tooltip') {
        return 'KYC is usually not required, but the provider may request it if this transaction is flagged.';
      }
      if (key === 'portfolio_quote_kyc_typically_required') {
        return 'KYC required';
      }
      return key;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows the payment method logo and label on buy/sell quotes', () => {
    render(
      <PortfolioQuoteCard
        quote={createQuote({ paymentMethod: 'credit_debit_card' })}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('Payment method')).toBeTruthy();
    const paymentMethod = screen.getByTestId(
      'portfolio-quote-card-payment-method',
    );
    expect(paymentMethod.textContent).toContain('Credit / Debit Card');
    expect(
      paymentMethod.querySelector('img')?.getAttribute('src'),
    ).toBe('/assets/images/portfolio/payment-methods/card.png');
  });

  it('distinguishes multiple quotes from the same provider by payment method', () => {
    const { rerender } = render(
      <PortfolioQuoteCard
        quote={createQuote({
          quoteId: 'moonpay:card',
          paymentMethod: 'credit_debit_card',
        })}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen
        .getByTestId('portfolio-quote-card-payment-method')
        .querySelector('img')
        ?.getAttribute('src'),
    ).toBe('/assets/images/portfolio/payment-methods/card.png');

    rerender(
      <PortfolioQuoteCard
        quote={createQuote({
          quoteId: 'moonpay:apple',
          estimatedToAmount: '0.049',
          paymentMethod: 'apple_pay',
        })}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('Apple Pay')).toBeTruthy();
    expect(
      screen
        .getByTestId('portfolio-quote-card-payment-method')
        .querySelector('img')
        ?.getAttribute('src'),
    ).toBe('/assets/images/portfolio/payment-methods/apple-pay.png');
  });

  it('omits the payment method row when the quote has none', () => {
    render(
      <PortfolioQuoteCard
        quote={createQuote()}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.queryByTestId('portfolio-quote-card-payment-method'),
    ).toBeNull();
  });

  it('shows a KYC chip for never, possible, and typically_required quotes', () => {
    const { rerender } = render(
      <PortfolioQuoteCard
        quote={createQuote()}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('portfolio-kyc-chip').textContent).toBe('No KYC');
    expect(screen.getByTestId('portfolio-kyc-chip').getAttribute('data-kyc')).toBe(
      'never',
    );
    expect(screen.queryByTestId('portfolio-kyc-chip-info')).toBeNull();

    rerender(
      <PortfolioQuoteCard
        quote={createQuote({ kyc: 'possible' })}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('portfolio-kyc-chip').textContent).toBe(
      'Possible KYC',
    );
    expect(screen.getByTestId('portfolio-kyc-chip').getAttribute('data-kyc')).toBe(
      'possible',
    );
    expect(screen.getByTestId('portfolio-kyc-chip-info')).toBeTruthy();

    rerender(
      <PortfolioQuoteCard
        quote={createQuote({ kyc: 'typically_required' })}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('portfolio-kyc-chip').textContent).toBe(
      'KYC required',
    );
    expect(screen.getByTestId('portfolio-kyc-chip').getAttribute('data-kyc')).toBe(
      'typically_required',
    );
  });

  it('explains the usually-no-KYC chip in a tooltip', () => {
    jest.useFakeTimers();
    render(
      <PortfolioQuoteCard
        quote={createQuote({ kyc: 'possible' })}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    fireEvent.mouseEnter(screen.getByTestId('portfolio-kyc-chip-tooltip'));
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByTestId('tooltip-content').textContent).toBe(
      'KYC is usually not required, but the provider may request it if this transaction is flagged.',
    );
  });
});
