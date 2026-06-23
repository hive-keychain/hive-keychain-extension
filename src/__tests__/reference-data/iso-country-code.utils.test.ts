import { IsoCountryCodeUtils } from 'src/reference-data/iso-country-code.utils';

describe('IsoCountryCodeUtils', () => {
  it('returns the regional indicator flag emoji for a valid ISO code', () => {
    expect(IsoCountryCodeUtils.getIsoCountryFlagEmoji('US')).toBe('🇺🇸');
    expect(IsoCountryCodeUtils.getIsoCountryFlagEmoji('fr')).toBe('🇫🇷');
  });

  it('returns an empty string for invalid country codes', () => {
    expect(IsoCountryCodeUtils.getIsoCountryFlagEmoji('')).toBe('');
    expect(IsoCountryCodeUtils.getIsoCountryFlagEmoji('USA')).toBe('');
    expect(IsoCountryCodeUtils.getIsoCountryFlagEmoji('U1')).toBe('');
  });
});
