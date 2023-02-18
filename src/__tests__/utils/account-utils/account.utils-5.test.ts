import { DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import FormatUtils from 'src/utils/format.utils';
import * as dataAccounts from 'src/__tests__/utils-for-testing/data/accounts';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
config.byDefault();
describe('account.utils part 5 tests:\n', () => {
  const { extraMocks, constants, methods } = accountUtilsMocks;
  methods.afterEach;
  describe('deleteAccount tests:\n', () => {
    test('when passed a localAccounts array with the accountName in it, must return the filtered array', () => {
      const _accounts: LocalAccount[] = [
        { name: 'workerjab1', keys: {} },
        { name: 'workerjab2', keys: {} },
      ];
      const result = AccountUtils.deleteAccount('workerjab1', _accounts);
      const expected_obj = _accounts.filter(
        (item) => item.name !== 'workerjab1',
      );
      expect(result).toEqual(expected_obj);
    });
    test('when passed a localAccounts array without the accountName in it, must return the original filtered array', () => {
      const _accounts: LocalAccount[] = [
        { name: 'workerjab1', keys: {} },
        { name: 'workerjab2', keys: {} },
      ];
      const result = AccountUtils.deleteAccount('workerjab3', _accounts);
      const expected_obj = _accounts.filter(
        (item) => item.name !== 'workerjab3',
      );
      expect(result).toEqual(expected_obj);
    });
  });
  describe('isAccountListIdentical tests:\n', () => {
    test('returns true if both lists are identical', () => {
      const _accounts1: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const _accounts2: LocalAccount[] = [{ name: 'theghost1980', keys: {} }];
      const result = AccountUtils.isAccountListIdentical(
        _accounts1,
        _accounts2,
      );
      expect(result).toBe(true);
    });
    test('returns false if both lists are not identical', () => {
      const _accounts1: LocalAccount[] = [
        { name: 'theghost1980', keys: { posting: '12345678' } },
      ];
      const _accounts2: LocalAccount[] = [{ keys: {}, name: 'theghost1980' }];
      const result = AccountUtils.isAccountListIdentical(
        _accounts1,
        _accounts2,
      );
      expect(result).toBe(false);
    });
  });
  describe('getAccountValue tests:\n', () => {
    FormatUtils.withCommas = jest.fn().mockReturnValue(1.51);
    FormatUtils.toHP = jest.fn().mockReturnValue(1.51);
    const { balances } = constants;
    test('must return 0 when passed invalid hiveDollar.usd', () => {
      const currencies = {
        hive: { usd: 1.0 },
        hive_dollar: {},
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        utilsT.dynamicPropertiesObj,
      );
      expect(result).toBe(0);
    });
    test('must return 0 when passed invalid hive.usd', () => {
      const currencies = {
        hive: {},
        hive_dollar: { usd: 1.0 },
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        utilsT.dynamicPropertiesObj,
      );
      expect(result).toBe(0);
    });
    test('must return valid value of 1, when passed valids hive.usd and hive_dollar.usd', () => {
      const currencies = {
        hive: { usd: 1.0 },
        hive_dollar: { usd: 1.0 },
        bitcoin: {},
      } as CurrencyPrices;
      const result = AccountUtils.getAccountValue(
        balances,
        currencies,
        utilsT.dynamicPropertiesObj,
      );
      expect(result).toBe(1.51);
    });
  });
  describe('getPowerDown tests:\n', () => {
    test('must return a valid array as [withdrawn, total_withdrawing, next_vesting_withdrawal]', () => {
      const account_details = {
        withdrawn: '1.00',
        to_withdraw: '1.00',
        next_vesting_withdrawal: '1.00',
      } as ExtendedAccount;
      const globalPropsUsed = {
        total_vesting_fund_hive: '1.0 HIVE',
        total_vesting_shares: '1.0 VESTS',
      } as DynamicGlobalProperties;
      const result_array = AccountUtils.getPowerDown(
        account_details,
        globalPropsUsed,
      );
      expect(result_array).toEqual(['0', '0', '1.00']);
    });
  });
  describe('doesAccountExist tests:\n', () => {
    test('with a existing account must return true', async () => {
      extraMocks.getAccounts([dataAccounts.default.extended]);
      const result = await AccountUtils.doesAccountExist('theghost1980');
      expect(result).toBe(true);
    });
    test('with a non existing account must return false', async () => {
      extraMocks.getAccounts([]);
      const result = await AccountUtils.doesAccountExist('theghost19809918912');
      expect(result).toBe(false);
    });
  });
});
