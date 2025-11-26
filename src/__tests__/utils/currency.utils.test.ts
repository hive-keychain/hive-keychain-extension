import CurrencyUtils from '@hiveapp/utils/currency.utils';

describe('currency.utils tests:\n', () => {
  describe('getCurrencyLabels tests:\n', () => {
    test('Passing isTestnet as true must return currency labels (currently always mainnet)', () => {
      const isTestnet = true;
      const result = CurrencyUtils.getCurrencyLabels(isTestnet);
      // Implementation currently always returns mainnet labels (testnet support commented out)
      expect(result).toEqual({ hbd: 'HBD', hive: 'HIVE', hp: 'HP' });
    });

    test('Passing isTestnet as false must return currency labels for mainnet', () => {
      const isTestnet = false;
      const result = CurrencyUtils.getCurrencyLabels(isTestnet);
      expect(result).toEqual({ hbd: 'HBD', hive: 'HIVE', hp: 'HP' });
    });
  });

  describe('getCurrencyLabel tests:\n', () => {
    test('Passing an empty currency and isTesnet as true, must return ""', () => {
      const isTestnet = true;
      const currency = '';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      expect(result).toBe('');
    });

    test('Passing an empty currency and isTesnet as false, must return ""', () => {
      const isTestnet = false;
      const currency = '';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      expect(result).toBe('');
    });

    test('Passing currency="hive" and isTesnet as false, must return currency in uppercase', () => {
      const isTestnet = false;
      const currency = 'hive';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      expect(result).toBe('HIVE');
    });

    test('Passing currency="hbd" and isTesnet as false, must return currency in uppercase', () => {
      const isTestnet = false;
      const currency = 'hbd';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      expect(result).toBe('HBD');
    });

    test('Passing currency="hp" and isTesnet as false, must return currency in uppercase', () => {
      const isTestnet = false;
      const currency = 'hp';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      expect(result).toBe('HP');
    });

    test('Passing currency="hive" and isTesnet as true, must return HIVE (testnet support disabled)', () => {
      const isTestnet = true;
      const currency = 'hive';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      // Implementation currently always returns mainnet labels
      expect(result).toBe('HIVE');
    });

    test('Passing currency="hbd" and isTesnet as true, must return HBD (testnet support disabled)', () => {
      const isTestnet = true;
      const currency = 'hbd';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      // Implementation currently always returns mainnet labels
      expect(result).toBe('HBD');
    });

    test('Passing currency="hp" and isTesnet as true, must return HP (testnet support disabled)', () => {
      const isTestnet = true;
      const currency = 'hp';
      const result = CurrencyUtils.getCurrencyLabel(currency, isTestnet);
      // Implementation currently always returns mainnet labels
      expect(result).toBe('HP');
    });
  });
});
