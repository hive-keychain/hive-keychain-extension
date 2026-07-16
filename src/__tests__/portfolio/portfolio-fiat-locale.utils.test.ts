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
      .mockImplementation((key: string) =>
        key === 'portfolio_payment_method_sepa_bank_transfer'
          ? 'SEPA bank transfer'
          : key,
      );

    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: 'SEPA_BANK_TRANSFER',
        label: 'Ignored English label',
      }),
    ).toBe('SEPA bank transfer');

    expect(
      PortfolioFiatLocaleUtils.getPaymentMethodLabel({
        id: 'UNKNOWN_METHOD',
        label: 'Mystery Method',
      }),
    ).toBe('Mystery Method');
  });
});
