import { PortfolioFiatLocaleUtils } from 'src/portfolio/portfolio-fiat-locale.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('PortfolioFiatLocaleUtils', () => {
  afterEach(() => {
    PortfolioFiatLocaleUtils.resetResolvedFiatLocaleForTests();
    jest.restoreAllMocks();
  });

  it('maps UI locale regions to preferred fiat currencies', () => {
    expect(PortfolioFiatLocaleUtils.getPreferredFiatCurrencyCode('fr-FR')).toBe(
      'EUR',
    );
    expect(PortfolioFiatLocaleUtils.getPreferredFiatCurrencyCode('en-GB')).toBe(
      'GBP',
    );
    expect(PortfolioFiatLocaleUtils.getPreferredFiatCurrencyCode('en-PH')).toBe(
      'PHP',
    );
    expect(PortfolioFiatLocaleUtils.getPreferredRegionCode('de-DE')).toBe('DE');
    expect(PortfolioFiatLocaleUtils.getFiatCurrencyForRegion('TW')).toBe('TWD');
  });

  it('falls back to USD when the region cannot be resolved', () => {
    expect(
      PortfolioFiatLocaleUtils.getPreferredFiatCurrencyCode('invalid-locale!!!'),
    ).toBe('USD');
  });

  it('picks the preferred currency when available, otherwise USD or first', () => {
    expect(
      PortfolioFiatLocaleUtils.pickPreferredFiatCurrency(
        ['USD', 'EUR', 'GBP'],
        'EUR',
      ),
    ).toBe('EUR');
    expect(
      PortfolioFiatLocaleUtils.pickPreferredFiatCurrency(['USD', 'GBP'], 'EUR'),
    ).toBe('USD');
    expect(
      PortfolioFiatLocaleUtils.pickPreferredFiatCurrency(['JPY'], 'EUR'),
    ).toBe('JPY');
  });

  it('prefers backend geo country when provided', async () => {
    await expect(
      PortfolioFiatLocaleUtils.resolvePreferredFiatLocale({
        backendCountryCode: 'TW',
      }),
    ).resolves.toEqual({
      countryCode: 'TW',
      fiatCurrency: 'TWD',
      source: 'geo',
    });
  });

  it('falls back to client IP geo when backend country is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ country: 'tw' }),
    });

    await expect(
      PortfolioFiatLocaleUtils.resolvePreferredFiatLocale({
        backendCountryCode: null,
      }),
    ).resolves.toEqual({
      countryCode: 'TW',
      fiatCurrency: 'TWD',
      source: 'geo',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.country.is/',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    );
  });

  it('builds fiat select labels with flag emoji and localized full names', () => {
    expect(
      PortfolioFiatLocaleUtils.getFiatCurrencyDisplayName('USD', 'en-US'),
    ).toBe('US Dollar');
    expect(
      PortfolioFiatLocaleUtils.getFiatCurrencyDisplayName('EUR', 'en-US'),
    ).toBe('Euro');
    expect(PortfolioFiatLocaleUtils.getFiatCurrencyFlagEmoji('USD')).toBe('🇺🇸');
    expect(PortfolioFiatLocaleUtils.getFiatCurrencyFlagEmoji('EUR')).toBe('🇪🇺');
    expect(
      PortfolioFiatLocaleUtils.getFiatCurrencySelectOptionFields('TWD', 'en-US'),
    ).toEqual({
      label: '🇹🇼 New Taiwan Dollar',
      subLabel: 'TWD',
    });
  });

  it('falls back to the currency code when the display name is unavailable', () => {
    expect(
      PortfolioFiatLocaleUtils.getFiatCurrencyDisplayName('ZZZ', 'en-US'),
    ).toBe('ZZZ');
    expect(PortfolioFiatLocaleUtils.getFiatCurrencyFlagEmoji('ZZZ')).toBe('');
    expect(
      PortfolioFiatLocaleUtils.getFiatCurrencySelectLabel('ZZZ', 'en-US'),
    ).toBe('ZZZ');
  });

  it('translates known payment method ids and falls back to API labels', () => {
    jest
      .spyOn(I18nUtils, 'getMessage')
      .mockImplementation((key: string) => {
        if (key === 'portfolio_payment_method_sepa_bank_transfer') {
          return 'SEPA bank transfer';
        }
        if (key === 'portfolio_payment_method_manual_bank_transfer') {
          return 'Manual bank transfer';
        }
        if (key === 'portfolio_payment_method_auto_bank_transfer') {
          return 'Automatic bank transfer';
        }
        return key;
      });

    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: 'SEPA_BANK_TRANSFER',
        label: 'Ignored English label',
      }),
    ).toBe('SEPA bank transfer');

    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: 'MANUAL_BANK_TRANSFER',
        label: 'Ignored English label',
      }),
    ).toBe('Manual bank transfer');

    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: 'AUTO_BANK_TRANSFER',
        label: 'Ignored English label',
      }),
    ).toBe('Automatic bank transfer');

    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: 'UNKNOWN_METHOD',
        label: 'Mystery Method',
      }),
    ).toBe('Mystery Method');
  });

  it('maps known payment method ids to logos and falls back by keyword', () => {
    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLogo('CREDIT_DEBIT_CARD'),
    ).toBe('/assets/images/portfolio/payment-methods/card.png');
    expect(PortfolioFiatLocaleUtils.getPaymentMethodLogo('APPLE_PAY')).toBe(
      '/assets/images/portfolio/payment-methods/apple-pay.png',
    );
    expect(PortfolioFiatLocaleUtils.getPaymentMethodLogo('GOOGLE')).toBe(
      '/assets/images/portfolio/payment-methods/google-pay.png',
    );
    expect(PortfolioFiatLocaleUtils.getPaymentMethodLogo('PAYPAL')).toBe(
      '/assets/images/portfolio/payment-methods/paypal.png',
    );
    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLogo('SEPA_BANK_TRANSFER'),
    ).toBe('/assets/images/portfolio/payment-methods/sepa.png');
    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLogo('PIX_INSTANT_PAYMENT'),
    ).toBe('/assets/images/portfolio/payment-methods/pix.png');
    expect(PortfolioFiatLocaleUtils.getPaymentMethodLogo('BLIK-DIRECT')).toBe(
      '/assets/images/portfolio/payment-methods/blik.png',
    );
    expect(PortfolioFiatLocaleUtils.getPaymentMethodLogo('INTERAC_GK')).toBe(
      '/assets/images/portfolio/payment-methods/interac.png',
    );
    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLogo('PM_OPEN_BANKING'),
    ).toBe('/assets/images/portfolio/payment-methods/bank.png');
    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLogo('SOME_NEW_VISA_METHOD'),
    ).toBe('/assets/images/portfolio/payment-methods/card.png');
    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLogo('UNKNOWN_METHOD'),
    ).toBeUndefined();
  });
});

