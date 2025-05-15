import { Asset, DynamicGlobalProperties } from '@hiveio/dhive';
import { FormatUtils } from 'hive-keychain-commons';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';

describe('format.utils tests:\n', () => {
  const iterationValuesNoDecimals = [
    { input: 1e3, expectedString: '1k' },
    { input: 10e3, expectedString: '10k' },
    { input: 100e3, expectedString: '100k' },
    { input: 1e6, expectedString: '1M' },
    { input: 10e6, expectedString: '10M' },
    { input: 100e6, expectedString: '100M' },
    { input: 1e9, expectedString: '1G' },
    { input: 10e9, expectedString: '10G' },
    { input: 100e9, expectedString: '100G' },
    { input: 1e12, expectedString: '1T' },
    { input: 10e12, expectedString: '10T' },
    { input: 100e12, expectedString: '100T' },
    { input: 1e15, expectedString: '1P' },
    { input: 10e15, expectedString: '10P' },
    { input: 100e15, expectedString: '100P' },
    { input: 1e18, expectedString: '1E' },
  ];
  const iterationValuesWithDecimals1 = [
    { input: 0.0, expectedString: '0', decimals: 1 },
    { input: 0.0, expectedString: '0', decimals: 2 },
    { input: 0.1, expectedString: '0.1', decimals: 1 },
    { input: 0.1234, expectedString: '0.12', decimals: 2 },
    { input: 0.1234, expectedString: '0.123', decimals: 3 },
    { input: 0.1234, expectedString: '0.1234', decimals: 4 },
  ];
  const iterationValuesWithDecimals2 = [
    { input: 1000.0123, expectedString: '1k', decimals: 1 },
    { input: 100000.0123, expectedString: '100k', decimals: 2 },
    { input: 10000000.1, expectedString: '10M', decimals: 1 },
    { input: 1000000000000.1234, expectedString: '1T', decimals: 2 },
    { input: 10000000000000.12345432, expectedString: '10T', decimals: 5 },
    {
      input: 10000045600000.12345432,
      expectedString: '10.00005T',
      decimals: 5,
    },
    { input: 100000000000000.12345432, expectedString: '100T', decimals: 4 },
    { input: 1450000000000000.12345432, expectedString: '1.45P', decimals: 4 },
  ];
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('withCommas tests:\n', () => {
    test('Passing a currency value using a comma, must return same value in U.S format standards', () => {
      const result = FormatUtils.withCommas('12,38 HIVE');
      expect(result).toBe('12.000 HIVE');
    });
    test('Passing a currency value using a dot, must return same value in U.S format standards', () => {
      const result = FormatUtils.withCommas('12.1 HBD');
      expect(result).toBe('12.100 HBD');
    });
    test('Passing a currency value(i.e USD) using a dot, must return same value in U.S format standards', () => {
      const result = FormatUtils.withCommas('9999.09 USD');
      expect(result).toBe('9,999.090 USD');
    });
    test('Passing a currency value=" USD", must return NaN USD', () => {
      const result = FormatUtils.withCommas(' USD');
      expect(result).toBe('NaN USD');
    });
    test('Passing a currency value="AA USD", must return NaN USD', () => {
      const result = FormatUtils.withCommas(' USD');
      expect(result).toBe('NaN USD');
    });
    test('Passing a currency value="12999.000 HP", must return same value in U.S format standards', () => {
      const result = FormatUtils.withCommas('12999.000 HP');
      expect(result).toBe('12,999.000 HP');
    });
    test('Passing a big currency value="128899899999.88999099 HP", must return same value in U.S format standards but with only 3 decimals', () => {
      const result = FormatUtils.withCommas('128899899999.88999099 HP');
      expect(result).toBe('128,899,899,999.890 HP');
    });
    test('Passing a negative currency value="-1200.909 USD", must return same value in U.S format standards', () => {
      const result = FormatUtils.withCommas('-1200.909 USD');
      expect(result).toBe('-1,200.909 USD');
    });
    test('Passing an empty string, must return NaN', () => {
      const result = FormatUtils.withCommas('');
      expect(result).toBe('NaN');
    });
    test('Passing a currency value and decimals, must return same value in U.S format standards with the specified decimals', () => {
      const result = FormatUtils.withCommas('12.9900901 HP', 7);
      expect(result).toBe('12.9900901 HP');
    });
    test('Passing a currency value bad formatted(1 23 .45 HP), will return "1.000 23"', () => {
      const result = FormatUtils.withCommas('1 23 .45 HP');
      expect(result).toBe('1.000 23');
    });
    test('Passing a currency value bad formatted(1 23 .450 HP) with decimals, will return "1.0000 23"', () => {
      const result = FormatUtils.withCommas('1 23 .450 HP', 4);
      expect(result).toBe('1.0000 23');
    });
    test('Passing a Big currency value and decimals, must return same value in U.S format standards with the specified decimals', () => {
      const result = FormatUtils.withCommas('1200990098.9900901 HP', 7);
      expect(result).toBe('1,200,990,098.9900901 HP');
    });
    test('Passing a currency value and decimals(negative), will thrown a RangeError', () => {
      const rangeError = new RangeError(
        'toFixed() digits argument must be between 0 and 100',
      );
      try {
        const result = FormatUtils.withCommas('1.9900901 HP', -2);
        expect(result).toBe('1,200,990,098.9900901 HP');
      } catch (error) {
        expect(error).toEqual(rangeError);
      }
    });
    test('Passing a currency value and decimals(greater than 100), will thrown a RangeError', () => {
      const rangeError = new RangeError(
        'toFixed() digits argument must be between 0 and 100',
      );
      try {
        const result = FormatUtils.withCommas('1.9900901 HP', 101);
        expect(result).toBe('1,200,990,098.9900901 HP');
      } catch (error) {
        expect(error).toEqual(rangeError);
      }
    });
  });

  describe('toHP tests:\n', () => {
    test('Passing a vesting balance and no props, will return 0', () => {
      const total_vesting_shares = '283471198739.626565 VESTS';
      const result = FormatUtils.toHP(total_vesting_shares);
      expect(result).toBe(0);
    });
    test('Passing an Empty vesting balance and no props, will return 0', () => {
      const total_vesting_shares = '';
      const result = FormatUtils.toHP(total_vesting_shares);
      expect(result).toBe(0);
    });
    test('Passing a vesting balance and valid props(as declared bellow), must return 1', () => {
      const vesting_balance = '1.000 HIVE';
      const dynamicProps = {
        total_vesting_fund_hive: '1000.000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.toHP(vesting_balance, dynamicProps);
      expect(result).toBe(1);
    });
    test('Passing a negative vesting balance and valid props(as declared bellow), must return -1', () => {
      const vesting_balance = '-1.000 HIVE';
      const dynamicProps = {
        total_vesting_fund_hive: '1000.000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.toHP(vesting_balance, dynamicProps);
      expect(result).toBe(-1);
    });
    test('Passing a vesting balance and invalid props(as declared bellow), will return Infinity', () => {
      const vesting_balance = '1.000 HIVE';
      const dynamicProps = {
        total_vesting_fund_hive: '1.00000 HIVE',
        total_vesting_shares: '0.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.toHP(vesting_balance, dynamicProps);
      expect(result).toBe(Infinity);
    });
    test('Passing a vesting balance and invalid props(as declared bellow), will return NaN', () => {
      const vesting_balance = '1.000 HIVE';
      const dynamicProps = {
        total_vesting_fund_hive: '0.00000 HIVE',
        total_vesting_shares: '0.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.toHP(vesting_balance, dynamicProps);
      expect(result).toBe(NaN);
    });
    test('Passing vesting balance and valid props(as declared in fake-data.utils), must return expected value defined bellow', () => {
      const expectedValue: number = 0.5458633941648806;
      const vesting_balance = '1000.000 HIVE';
      const result = FormatUtils.toHP(
        vesting_balance,
        dynamic.globalProperties,
      );
      expect(result).toBe(expectedValue);
    });
  });

  describe('fromHP tests:\n', () => {
    test('Passing hp and valid props(as declared in fake-data.utils), must return expected value defined bellow', () => {
      const expectedValue: number = 1000;
      const hp = '0.5458633941648806';
      const result = FormatUtils.fromHP(hp, dynamic.globalProperties);
      expect(result).toBe(expectedValue);
    });
    test('Passing hp and invalid props(as declared bellow), will return NaN', () => {
      const dynamicProps = {
        total_vesting_fund_hive: '0.00000 HIVE',
        total_vesting_shares: '0.000 VESTS',
      } as DynamicGlobalProperties;
      const hp = '0.5458633941648806';
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(NaN);
    });
    test('Passing hp and invalid props(as declared bellow), will return Infinity', () => {
      const dynamicProps = {
        total_vesting_fund_hive: '0.00000 HIVE',
        total_vesting_shares: '1.000 VESTS',
      } as DynamicGlobalProperties;
      const hp = '0.5458633941648806';
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(Infinity);
    });
    test('Passing a negative hp balance and valid props(as declared bellow), will return negative HP', () => {
      const dynamicProps = {
        total_vesting_fund_hive: '1000.00000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const hp = '-1.000';
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(-1);
    });
    test('Passing hp and valid props(as declared bellow), will return 1', () => {
      const dynamicProps = {
        total_vesting_fund_hive: '1000.00000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const hp = '1.000';
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(1);
    });
    test('Passing an Empty hp and valid props, will return NaN', () => {
      const hp = '';
      const dynamicProps = {
        total_vesting_fund_hive: '1000.00000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(NaN);
    });
    test('Passing hp="String" and valid props, will return NaN', () => {
      const hp = 'String';
      const dynamicProps = {
        total_vesting_fund_hive: '1000.00000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(NaN);
    });
    test('Passing hp="0" and valid props, must return 0', () => {
      const hp = '0';
      const dynamicProps = {
        total_vesting_fund_hive: '1000.00000 HIVE',
        total_vesting_shares: '1000.000 VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(0);
    });
    test('Passing hp="0" and invalid props, will return NaN', () => {
      const hp = '0';
      const dynamicProps = {
        total_vesting_fund_hive: 'HIVE',
        total_vesting_shares: ' VESTS',
      } as DynamicGlobalProperties;
      const result = FormatUtils.fromHP(hp, dynamicProps);
      expect(result).toBe(NaN);
    });
  });

  describe('formatCurrencyValue tests:\n', () => {
    test('Passing a valid new asset and no digits parameter, must return valid U.S currency format with 3 digits', () => {
      const value = new Asset(10, 'HBD');
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('10.000');
    });
    test('Passing a valid currency string and no digits parameter, must return valid U.S currency format with 3 digits without the currency name', () => {
      const value = '10 HBD';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('10.000');
    });
    test('Passing a valid currency string(with digits) and no digits parameter, must return valid U.S currency format with 3 digits without the currency name', () => {
      const value = '10.899 HIVE';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('10.899');
    });
    test('Passing a valid currency string(currency name in lowercase and digits) and no digits parameter, will return "10.899 hive"', () => {
      const value = '10.899 hive';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('10.899 hive');
    });
    test('Passing a valid currency string(currency name in lowercase and digits) and no digits parameter, will return "10.899 hbd"', () => {
      const value = '10.899 hbd';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('10.899 hbd');
    });
    test('Passing a negative currency string and no digits parameter, must return valid U.S currency format with 3 digits without the currency name', () => {
      const value = '-10.899 HIVE';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('-10.899');
    });
    test('Passing a BIG currency string and no digits parameter, must return valid U.S currency format with 3 digits without the currency name', () => {
      const value = '100099000900.899 HIVE';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('100,099,000,900.899');
    });
    test('Passing a bad formatted currency string("100  .00 HIVE") and no digits parameter, will return "100.000"', () => {
      const value = '100  .00 HIVE';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('100.000');
    });
    test('Passing an empty string and no digits parameter, will return "NaN"', () => {
      const value = '';
      const result = FormatUtils.formatCurrencyValue(value);
      expect(result).toBe('NaN');
    });
    test('Passing an currency string and digits parameter greater than limit, will thrown an error', () => {
      const rangeError = new RangeError(
        'toFixed() digits argument must be between 0 and 100',
      );
      const value = '100.889988998 HIVE';
      try {
        const result = FormatUtils.formatCurrencyValue(value, 101);
        expect(result).toBe(NaN);
      } catch (error) {
        expect(error).toEqual(rangeError);
      }
    });
    test('Passing an currency string and digits parameter smaller than limit, will thrown an error', () => {
      const rangeError = new RangeError(
        'toFixed() digits argument must be between 0 and 100',
      );
      const value = '100.889988998 HIVE';
      try {
        const result = FormatUtils.formatCurrencyValue(value, -1);
        expect(result).toBe(NaN);
      } catch (error) {
        expect(error).toEqual(rangeError);
      }
    });
  });

  describe('nFormatter tests:\n', () => {
    test('Passing (number = 10, digits: 0) will return the number as a string with 0 digits', () => {
      const result = FormatUtils.nFormatter(10, 0);
      expect(result).toBe('10');
    });
    test('Passing (number = 0, digits: 0) will return the number as a string with 0 digits', () => {
      const result = FormatUtils.nFormatter(0, 0);
      expect(result).toBe('0');
    });
    test('Passing (number = 10.001, digits: 0) will return the number as string with 0 digits', () => {
      const result = FormatUtils.nFormatter(10.001, 0);
      expect(result).toBe('10');
    });
    test('Passing (number = 10.001, digits: 3) will return the number as string with 3 digits', () => {
      const result = FormatUtils.nFormatter(10.001, 3);
      expect(result).toBe('10.001');
    });
    test('Must return a string with custom exponencial representation, i.e: 1e3 must return 1k(no decimals). For each case on the data array', () => {
      const iterationValues = [...iterationValuesNoDecimals];
      const showValuesIteration = false;
      for (let i = 0; i < iterationValues.length; i++) {
        if (showValuesIteration) {
          console.log(
            `About to test nFormatter(num:${iterationValues[
              i
            ].input.toExponential(0)}, digits: 0)\nIt should return: ${
              iterationValues[i].expectedString
            }`,
          );
        }
        let result = FormatUtils.nFormatter(iterationValues[i].input, 0);
        expect(result).toBe(iterationValues[i].expectedString);
        if (showValuesIteration) {
          console.log(`Returned: ${result}`);
        }
      }
    });

    test('Must return a string with the asked decimals, i.e: 0.13 must return 0.1 if asked 1 decimal. Same for each case on the data array', () => {
      const iterationValues = [...iterationValuesWithDecimals1];
      const showValuesIteration = false;
      const showArrayToTest = false;
      if (showArrayToTest) {
        console.log(iterationValues);
      }
      for (let i = 0; i < iterationValues.length; i++) {
        if (showValuesIteration) {
          console.log(
            `About to test: ${iterationValues[i].input}\nDecimals: ${iterationValues[i].decimals}\nExpected String as: ${iterationValues[i].expectedString}`,
          );
        }
        let result = FormatUtils.nFormatter(
          iterationValues[i].input,
          iterationValues[i].decimals,
        );
        expect(result).toBe(iterationValues[i].expectedString);
        if (showValuesIteration) {
          console.log(`Returned: ${result}`);
        }
      }
    });
    test('Must return a string in exponential custom format, i.e: 100000.13 must return 100k. Same for each case on the data array', () => {
      const iterationValues = [...iterationValuesWithDecimals2];
      const showValuesIteration = false;
      const showArrayToTest = false;
      if (showArrayToTest) {
        console.log(iterationValues);
      }
      for (let i = 0; i < iterationValues.length; i++) {
        if (showValuesIteration) {
          console.log(
            `About to test: ${iterationValues[i].input}\nDecimals: ${iterationValues[i].decimals}\nExpected String as: ${iterationValues[i].expectedString}`,
          );
        }
        let result = FormatUtils.nFormatter(
          iterationValues[i].input,
          iterationValues[i].decimals,
        );
        expect(result).toBe(iterationValues[i].expectedString);
        if (showValuesIteration) {
          console.log(`Returned: ${result}`);
        }
      }
    });

    test('Passing a bigger number than accepted, will return number with E custom notation', () => {
      expect(FormatUtils.nFormatter(1e22, 0)).toBe('10000E');
    });
  });

  describe('hasMoreThanXDecimal tests:\n', () => {
    test('Passing a number with 3 decimals and asking if has more than 1 decimals must return true', () => {
      const result = FormatUtils.hasMoreThanXDecimal(12.001, 1);
      expect(result).toBe(true);
    });
    test('Passing a number as [12.] and asking if has more than 1 decimals must return false', () => {
      const result = FormatUtils.hasMoreThanXDecimal(12, 1);
      expect(result).toBe(false);
    });
    test('Passing a number with 3 decimals and asking if has more than 2 decimals must return true', () => {
      const result = FormatUtils.hasMoreThanXDecimal(12.334, 2);
      expect(result).toBe(true);
    });
    test('Passing a number as 0 and asking if has more than 1 must return false', () => {
      const result = FormatUtils.hasMoreThanXDecimal(0, 1);
      expect(result).toBe(false);
    });
  });

  describe('toNumber tests:\n', () => {
    test('Passing an empty string must return NaN', () => {
      expect(FormatUtils.toNumber('')).toBe(NaN);
    });
    test('Passing a string containing a symbol must return NaN', () => {
      expect(FormatUtils.toNumber('@')).toBe(NaN);
    });
    test('Passing a string must return NaN', () => {
      expect(FormatUtils.toNumber('String')).toBe(NaN);
    });
    test('Passing a string containing a number must return a number', () => {
      expect(FormatUtils.toNumber('12')).toBe(12);
    });
    test('Passing a string containing a number with decimals must return a number with decimals', () => {
      expect(FormatUtils.toNumber('12.0091')).toBe(12.0091);
    });
    test('Passing a string containing a bad formatted("1 2 3") number will return 1', () => {
      expect(FormatUtils.toNumber('1 2 3')).toBe(1);
    });
    test('Passing a string containing a bad formatted("[1.24]") number will return NaN', () => {
      expect(FormatUtils.toNumber('[1.24]')).toBe(NaN);
    });
    test('Passing a string containing a long number will return a number with exponential notation and as an approximation', () => {
      expect(
        FormatUtils.toNumber('11232123121231238812399123120012312990123'),
      ).toBe(1.123212312123124e40);
    });
    test('Passing a string containing a long number with decimals will return a number with exponential notation and with decimals removed', () => {
      expect(
        FormatUtils.toNumber(
          '11232123121231238812399123120012312990123.12222323445566',
        ),
      ).toBe(1.123212312123124e40);
    });
    test('Passing a new Asset object will return the numeric value(amount)', () => {
      const asset = new Asset(100.89, 'STEEM');
      expect(FormatUtils.toNumber(asset)).toBe(100.89);
    });
  });

  describe('getSymbol tests:\n', () => {
    test('Passing "@@000000013" will return "HBD"', () => {
      expect(FormatUtils.getSymbol('@@000000013')).toBe('HBD');
    });
    test('Passing "@@000000021" will return "HIVE"', () => {
      expect(FormatUtils.getSymbol('@@000000021')).toBe('HIVE');
    });
    test('Passing "@@000000037" will return "HP"', () => {
      expect(FormatUtils.getSymbol('@@000000037')).toBe('HP');
    });
  });

  describe('fromNaiAndSymbol cases:/n', () => {
    it('Must return formated string', () => {
      expect(
        FormatUtils.fromNaiAndSymbol({
          amount: 1000,
          precision: 4,
          nai: '@@000000013',
        }),
      ).toBe('1.0000 HBD');
    });
  });

  describe('removeHtmlTags cases:/n', () => {
    it('Must remove html tags', () => {
      expect(
        FormatUtils.removeHtmlTags('<br>Text with html tags in it</br>'),
      ).toBe('Text with html tags in it');
    });
  });
});
