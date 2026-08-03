import { IsoCountryCodeUtils } from 'src/reference-data/iso-country-code.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

/**
 * ISO 3166-1 alpha-2 → primary ISO 4217 currency. Used to default the buy/sell
 * fiat selector from IP geo (preferred) or browser/UI locale region.
 */
const REGION_TO_FIAT_CURRENCY: Record<string, string> = {
  AD: 'EUR',
  AE: 'AED',
  AF: 'AFN',
  AG: 'XCD',
  AI: 'XCD',
  AL: 'ALL',
  AM: 'AMD',
  AO: 'AOA',
  AR: 'ARS',
  AT: 'EUR',
  AU: 'AUD',
  AW: 'AWG',
  AZ: 'AZN',
  BA: 'BAM',
  BB: 'BBD',
  BD: 'BDT',
  BE: 'EUR',
  BF: 'XOF',
  BG: 'BGN',
  BH: 'BHD',
  BI: 'BIF',
  BJ: 'XOF',
  BM: 'BMD',
  BN: 'BND',
  BO: 'BOB',
  BR: 'BRL',
  BS: 'BSD',
  BT: 'BTN',
  BW: 'BWP',
  BY: 'BYN',
  BZ: 'BZD',
  CA: 'CAD',
  CD: 'CDF',
  CF: 'XAF',
  CG: 'XAF',
  CH: 'CHF',
  CI: 'XOF',
  CL: 'CLP',
  CM: 'XAF',
  CN: 'CNY',
  CO: 'COP',
  CR: 'CRC',
  CV: 'CVE',
  CY: 'EUR',
  CZ: 'CZK',
  DE: 'EUR',
  DJ: 'DJF',
  DK: 'DKK',
  DM: 'XCD',
  DO: 'DOP',
  DZ: 'DZD',
  EC: 'USD',
  EE: 'EUR',
  EG: 'EGP',
  ER: 'ERN',
  ES: 'EUR',
  ET: 'ETB',
  FI: 'EUR',
  FJ: 'FJD',
  FR: 'EUR',
  GA: 'XAF',
  GB: 'GBP',
  GD: 'XCD',
  GE: 'GEL',
  GH: 'GHS',
  GI: 'GIP',
  GM: 'GMD',
  GN: 'GNF',
  GQ: 'XAF',
  GR: 'EUR',
  GT: 'GTQ',
  GW: 'XOF',
  GY: 'GYD',
  HK: 'HKD',
  HN: 'HNL',
  HR: 'EUR',
  HT: 'HTG',
  HU: 'HUF',
  ID: 'IDR',
  IE: 'EUR',
  IL: 'ILS',
  IN: 'INR',
  IQ: 'IQD',
  IR: 'IRR',
  IS: 'ISK',
  IT: 'EUR',
  JM: 'JMD',
  JO: 'JOD',
  JP: 'JPY',
  KE: 'KES',
  KG: 'KGS',
  KH: 'KHR',
  KM: 'KMF',
  KN: 'XCD',
  KR: 'KRW',
  KW: 'KWD',
  KY: 'KYD',
  KZ: 'KZT',
  LA: 'LAK',
  LB: 'LBP',
  LC: 'XCD',
  LI: 'CHF',
  LK: 'LKR',
  LR: 'LRD',
  LS: 'LSL',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  LY: 'LYD',
  MA: 'MAD',
  MC: 'EUR',
  MD: 'MDL',
  ME: 'EUR',
  MG: 'MGA',
  MK: 'MKD',
  ML: 'XOF',
  MM: 'MMK',
  MN: 'MNT',
  MO: 'MOP',
  MR: 'MRU',
  MT: 'EUR',
  MU: 'MUR',
  MV: 'MVR',
  MW: 'MWK',
  MX: 'MXN',
  MY: 'MYR',
  MZ: 'MZN',
  NA: 'NAD',
  NE: 'XOF',
  NG: 'NGN',
  NI: 'NIO',
  NL: 'EUR',
  NO: 'NOK',
  NP: 'NPR',
  NZ: 'NZD',
  OM: 'OMR',
  PA: 'PAB',
  PE: 'PEN',
  PG: 'PGK',
  PH: 'PHP',
  PK: 'PKR',
  PL: 'PLN',
  PT: 'EUR',
  PY: 'PYG',
  QA: 'QAR',
  RO: 'RON',
  RS: 'RSD',
  RU: 'RUB',
  RW: 'RWF',
  SA: 'SAR',
  SC: 'SCR',
  SD: 'SDG',
  SE: 'SEK',
  SG: 'SGD',
  SI: 'EUR',
  SK: 'EUR',
  SL: 'SLE',
  SM: 'EUR',
  SN: 'XOF',
  SO: 'SOS',
  SR: 'SRD',
  SS: 'SSP',
  ST: 'STN',
  SV: 'USD',
  SY: 'SYP',
  SZ: 'SZL',
  TD: 'XAF',
  TG: 'XOF',
  TH: 'THB',
  TJ: 'TJS',
  TM: 'TMT',
  TN: 'TND',
  TO: 'TOP',
  TR: 'TRY',
  TT: 'TTD',
  TW: 'TWD',
  TZ: 'TZS',
  UA: 'UAH',
  UG: 'UGX',
  US: 'USD',
  UY: 'UYU',
  UZ: 'UZS',
  VA: 'EUR',
  VC: 'XCD',
  VE: 'VES',
  VN: 'VND',
  VU: 'VUV',
  WS: 'WST',
  XK: 'EUR',
  YE: 'YER',
  ZA: 'ZAR',
  ZM: 'ZMW',
  ZW: 'ZWG',
};

/**
 * Representative region for shared / multi-country currencies when rendering a
 * flag. Overrides the first region found while inverting REGION_TO_FIAT_CURRENCY.
 */
const FIAT_CURRENCY_FLAG_REGION_OVERRIDES: Record<string, string> = {
  ANG: 'CW',
  EUR: 'EU',
  USD: 'US',
  XAF: 'CM',
  XCD: 'AG',
  XOF: 'SN',
  XPF: 'PF',
};

const buildFiatCurrencyToFlagRegion = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const [region, currency] of Object.entries(REGION_TO_FIAT_CURRENCY)) {
    if (!map[currency]) {
      map[currency] = region;
    }
  }
  return { ...map, ...FIAT_CURRENCY_FLAG_REGION_OVERRIDES };
};

const FIAT_CURRENCY_TO_FLAG_REGION = buildFiatCurrencyToFlagRegion();

const DEFAULT_FIAT_CURRENCY = 'USD';
const CLIENT_GEO_LOOKUP_TIMEOUT_MS = 2_500;

type ResolvedFiatLocale = {
  countryCode: string | undefined;
  fiatCurrency: string;
  source: 'geo' | 'browser_locale' | 'default';
};

let clientCountryLookupPromise: Promise<string | undefined> | null = null;

const getUiLocale = (): string => {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
      const uiLanguage = chrome.i18n.getUILanguage();
      if (uiLanguage?.trim()) {
        return uiLanguage.trim();
      }
    }
  } catch {
    // Fall through to navigator / default.
  }

  if (typeof navigator !== 'undefined' && navigator.language?.trim()) {
    return navigator.language.trim();
  }

  return 'en-US';
};

const getRegionCodeFromLocale = (locale: string): string | undefined => {
  try {
    const region = new Intl.Locale(locale).maximize().region;
    const normalized = region?.trim().toUpperCase();
    return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
  } catch {
    const match = locale.trim().match(/[-_]([A-Za-z]{2})$/);
    return match?.[1]?.toUpperCase();
  }
};

const getPreferredRegionCode = (locale = getUiLocale()): string | undefined =>
  getRegionCodeFromLocale(locale);

const getFiatCurrencyForRegion = (region: string | undefined): string => {
  if (!region) {
    return DEFAULT_FIAT_CURRENCY;
  }
  return REGION_TO_FIAT_CURRENCY[region] ?? DEFAULT_FIAT_CURRENCY;
};

const normalizePaymentMethodId = (methodId: string): string =>
  methodId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const normalizePaymentMethodMessageKey = (methodId: string): string =>
  `portfolio_payment_method_${normalizePaymentMethodId(methodId)}`;

const formatPaymentMethodIdForLabel = (methodId: string): string => {
  const normalized = methodId.replace(/[_-]+/g, ' ').trim();
  if (!normalized) {
    return methodId;
  }
  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
};

const PAYMENT_METHOD_LOGO_BASE_PATH =
  '/assets/images/portfolio/payment-methods';

const paymentMethodLogoPath = (fileName: string): string =>
  `${PAYMENT_METHOD_LOGO_BASE_PATH}/${fileName}`;

const PAYMENT_METHOD_LOGO_BY_ID: Record<string, string> = {
  ach_bank_transfer: paymentMethodLogoPath('bank.png'),
  apple: paymentMethodLogoPath('apple-pay.png'),
  apple_pay: paymentMethodLogoPath('apple-pay.png'),
  applepay: paymentMethodLogoPath('apple-pay.png'),
  auto_bank_transfer: paymentMethodLogoPath('bank.png'),
  bank_transfer: paymentMethodLogoPath('bank.png'),
  banktransfer: paymentMethodLogoPath('bank.png'),
  blik: paymentMethodLogoPath('blik.png'),
  blik_direct: paymentMethodLogoPath('blik.png'),
  card: paymentMethodLogoPath('card.png'),
  card_payment: paymentMethodLogoPath('card.png'),
  credit_debit_card: paymentMethodLogoPath('card.png'),
  creditcard: paymentMethodLogoPath('card.png'),
  eightbworld_instapay: paymentMethodLogoPath('bank.png'),
  gbp_bank_transfer: paymentMethodLogoPath('bank.png'),
  gbp_open_banking_payment: paymentMethodLogoPath('bank.png'),
  google: paymentMethodLogoPath('google-pay.png'),
  google_pay: paymentMethodLogoPath('google-pay.png'),
  googlepay: paymentMethodLogoPath('google-pay.png'),
  interac_gk: paymentMethodLogoPath('interac.png'),
  manual_bank_transfer: paymentMethodLogoPath('bank.png'),
  paypal: paymentMethodLogoPath('paypal.png'),
  pix: paymentMethodLogoPath('pix.png'),
  pix_instant_payment: paymentMethodLogoPath('pix.png'),
  pm_open_banking: paymentMethodLogoPath('bank.png'),
  pm_wire: paymentMethodLogoPath('bank.png'),
  sepa_bank_transfer: paymentMethodLogoPath('sepa.png'),
  unlimint_pix_brl: paymentMethodLogoPath('pix.png'),
};

const getPaymentMethodLogoByNormalizedId = (
  normalizedId: string,
): string | undefined => {
  const exactMatch = PAYMENT_METHOD_LOGO_BY_ID[normalizedId];
  if (exactMatch) {
    return exactMatch;
  }

  if (normalizedId.includes('apple')) {
    return paymentMethodLogoPath('apple-pay.png');
  }
  if (normalizedId.includes('google')) {
    return paymentMethodLogoPath('google-pay.png');
  }
  if (normalizedId.includes('paypal')) {
    return paymentMethodLogoPath('paypal.png');
  }
  if (normalizedId.includes('pix')) {
    return paymentMethodLogoPath('pix.png');
  }
  if (normalizedId.includes('blik')) {
    return paymentMethodLogoPath('blik.png');
  }
  if (normalizedId.includes('interac')) {
    return paymentMethodLogoPath('interac.png');
  }
  if (normalizedId.includes('sepa')) {
    return paymentMethodLogoPath('sepa.png');
  }
  if (
    normalizedId.includes('card') ||
    normalizedId.includes('visa') ||
    normalizedId.includes('mastercard')
  ) {
    return paymentMethodLogoPath('card.png');
  }
  if (
    normalizedId.includes('bank') ||
    normalizedId.includes('open_banking') ||
    normalizedId.includes('instapay') ||
    normalizedId.includes('ach') ||
    normalizedId.includes('wire')
  ) {
    return paymentMethodLogoPath('bank.png');
  }

  return undefined;
};

const getPaymentMethodLabel = (method: {
  id: string;
  label: string;
}): string => {
  const messageKey = normalizePaymentMethodMessageKey(method.id);
  const translated = I18nUtils.getMessage(messageKey);
  if (translated && translated !== messageKey) {
    return translated;
  }

  const fallbackLabel = method.label?.trim();
  return fallbackLabel || formatPaymentMethodIdForLabel(method.id);
};

const getPaymentMethodLogo = (methodId: string): string | undefined => {
  const normalizedId = normalizePaymentMethodId(methodId);
  if (!normalizedId) {
    return undefined;
  }
  return getPaymentMethodLogoByNormalizedId(normalizedId);
};

const lookupCountryCodeFromClientIp = async (): Promise<string | undefined> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CLIENT_GEO_LOOKUP_TIMEOUT_MS,
  );

  try {
    const response = await fetch('https://api.country.is/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { country?: unknown };
    const countryCode =
      typeof payload.country === 'string'
        ? payload.country.trim().toUpperCase()
        : '';
    return /^[A-Z]{2}$/.test(countryCode) ? countryCode : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Resolve preferred fiat locale from IP geo, then browser locale.
 * Pass `backendCountryCode` when `/fiat-ramp/locale` already returned a country
 * (production). When null/omitted, falls back to a direct client IP lookup
 * (needed when the portfolio API is on localhost and only sees 127.0.0.1).
 */
const resolvePreferredFiatLocale = async (options?: {
  backendCountryCode?: string | null;
}): Promise<ResolvedFiatLocale> => {
  const backendCountry = options?.backendCountryCode?.trim().toUpperCase();
  if (backendCountry && /^[A-Z]{2}$/.test(backendCountry)) {
    return {
      countryCode: backendCountry,
      fiatCurrency: getFiatCurrencyForRegion(backendCountry),
      source: 'geo',
    };
  }

  if (!clientCountryLookupPromise) {
    clientCountryLookupPromise = lookupCountryCodeFromClientIp();
  }
  const clientCountry = await clientCountryLookupPromise;
  if (clientCountry) {
    return {
      countryCode: clientCountry,
      fiatCurrency: getFiatCurrencyForRegion(clientCountry),
      source: 'geo',
    };
  }

  const browserCountry = getPreferredRegionCode();
  if (browserCountry) {
    return {
      countryCode: browserCountry,
      fiatCurrency: getFiatCurrencyForRegion(browserCountry),
      source: 'browser_locale',
    };
  }

  return {
    countryCode: undefined,
    fiatCurrency: DEFAULT_FIAT_CURRENCY,
    source: 'default',
  };
};

const getPreferredFiatCurrencyCode = (locale = getUiLocale()): string => {
  const region = getRegionCodeFromLocale(locale);
  return getFiatCurrencyForRegion(region);
};

const pickPreferredFiatCurrency = (
  availableCurrencies: string[],
  preferredCurrency = getPreferredFiatCurrencyCode(),
): string => {
  if (availableCurrencies.length === 0) {
    return preferredCurrency;
  }

  if (availableCurrencies.includes(preferredCurrency)) {
    return preferredCurrency;
  }

  if (availableCurrencies.includes(DEFAULT_FIAT_CURRENCY)) {
    return DEFAULT_FIAT_CURRENCY;
  }

  return availableCurrencies[0];
};

const normalizeFiatCurrencyCode = (currencyCode: string): string =>
  currencyCode.trim().toUpperCase();

const getFiatCurrencyDisplayName = (
  currencyCode: string,
  locale = getUiLocale(),
): string => {
  const normalized = normalizeFiatCurrencyCode(currencyCode);
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return currencyCode.trim() || currencyCode;
  }

  try {
    const displayName = new Intl.DisplayNames([locale], {
      type: 'currency',
    }).of(normalized);
    return displayName?.trim() || normalized;
  } catch {
    return normalized;
  }
};

const getFiatCurrencyFlagEmoji = (currencyCode: string): string => {
  const normalized = normalizeFiatCurrencyCode(currencyCode);
  const region = FIAT_CURRENCY_TO_FLAG_REGION[normalized];
  return region ? IsoCountryCodeUtils.getIsoCountryFlagEmoji(region) : '';
};

const getFiatCurrencySelectLabel = (
  currencyCode: string,
  locale = getUiLocale(),
): string => {
  const displayName = getFiatCurrencyDisplayName(currencyCode, locale);
  const flag = getFiatCurrencyFlagEmoji(currencyCode);
  return flag ? `${flag} ${displayName}` : displayName;
};

const getFiatCurrencySelectOptionFields = (
  currencyCode: string,
  locale = getUiLocale(),
): { label: string; subLabel: string } => {
  const normalized = normalizeFiatCurrencyCode(currencyCode);
  return {
    label: getFiatCurrencySelectLabel(currencyCode, locale),
    subLabel: normalized || currencyCode,
  };
};

/** Test helper: clear memoized client IP lookup. */
const resetResolvedFiatLocaleForTests = (): void => {
  clientCountryLookupPromise = null;
};

export const PortfolioFiatLocaleUtils = {
  DEFAULT_FIAT_CURRENCY,
  getFiatCurrencyDisplayName,
  getFiatCurrencyFlagEmoji,
  getFiatCurrencyForRegion,
  getFiatCurrencySelectLabel,
  getFiatCurrencySelectOptionFields,
  getPaymentMethodLabel,
  getPaymentMethodLogo,
  getPreferredFiatCurrencyCode,
  getPreferredRegionCode,
  getUiLocale,
  pickPreferredFiatCurrency,
  resetResolvedFiatLocaleForTests,
  resolvePreferredFiatLocale,
};
