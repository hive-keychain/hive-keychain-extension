import { ISO_COUNTRY_CODES } from 'src/reference-data/iso-country-code.list';

describe('ISO_COUNTRY_CODES', () => {
  it('includes unique ISO 3166-1 alpha-2 country codes', () => {
    const codes = ISO_COUNTRY_CODES.map((country) => country.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain('US');
    expect(codes).toContain('FR');
    expect(ISO_COUNTRY_CODES.length).toBeGreaterThan(200);
  });

  it('sorts countries alphabetically by name', () => {
    const names = ISO_COUNTRY_CODES.map((country) => country.name);
    const sortedNames = [...names].sort((left, right) =>
      left.localeCompare(right),
    );
    expect(names).toEqual(sortedNames);
  });
});
