import { render, screen } from '@testing-library/react';
import React from 'react';
import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioQuoteCard } from 'src/portfolio/ui/portfolio-quote-card.component';
import { I18nUtils } from 'src/utils/i18n.utils';

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
      return key;
    });
  });

  afterEach(() => {
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
});
