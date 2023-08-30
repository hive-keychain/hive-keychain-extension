import BgdAccountsUtils from '@background/utils/accounts.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('accounts.utils tests:\n', () => {
  const fileData = {
    encrypted: {
      msg: '000000c6000000230000005600000032000000a000000041000000660000009bF+Es8H+yzc6IXr5xCD7YU83e/Q4e+9vXh2fgSdk/Vyv17HJOJAGLr2a6Nt1t0UK21ZftWIuZ/PRsf7Oyw1Lz1GRHajWpWywYkfr4/8HGxYRt019dqu4fuFQz+rF2+F3pXFyYAQwbhc5mgWppdSBEzzGhRb4nhspzPLe2BjlGGyGz9r1oWmUd87TNXE4oD6GvC508F6NpX1o6fqK60NKf2gBdFgwtxI0UXdNxis3BCQRqnMbLs5Z1O3UPWOIaB6kcX+ezn+BPH1e+wHuJagYBJ7AJBbfXsqYGqmqxEb8XR6MzhnPyl3+nipzF6KShJyP4zaXfoI/h3BNHO2OCj5MNOcDWySVzNk3JOhcyZyPZw6ONQonOaOelTaEUP8fK4VRcHP2y8PXqQnHgrDdUXX5504sBQ8xrZneRUgxpDB2OQEP7epxfc6IWoI3gvQptscKVHMj/ySP1qYnk/C0KlPM+7P6yV8MnMO+hrqHxADr5CVc=',
      password: mk.user.one,
    },
    invalid: {
      msg: '954f487f879b7e847dd374825e6b15a150c7f4c77dc0646188d89d757a6bb0bagCmc00j0czkBe86wm587tLAhu0mPRYe0yN1P8I49RA9/Ua62NJUytBCUV4ob1g2e',
      password: 'new key',
    },
    original: [accounts.local.justTwoKeys],
  };
  const encrypt = {
    msg: '0000009b000000770000005700000029000000ae0000008d000000ae00000046WHrXFxuZRaj4uDwLXR8vFw+tW0M7fUZqAfRqnqga+fvyVCNAEnutR76JDJ+Hi6zfX2bMEkzk2c/fnL2FZb9e+ZNoklar2xYnxvM3tXjkh8Qj0roAbwXfWt+DzjqMfeTvuzHzbgnCzir7r5v6NgDug0pBplvNAsk83kj5Kd3gBmJfhRieDf8VRk18bZ8DUmhGqu0U0EmFn9KqSE6HxOKo/sZFRu0In8090s/05IHro9OLCZQ3vEy6A0GPyzoc5PyL/a7qgNiERpK37e3h3LXZBG9HkmDh0HimY2GoQzBYr7sOKFrrmfZlT7rtIuXWfa0nhQSM1pI9Y1s9Y2GWkoiUlweNRuTuAwFAi+SuEHRHBtmokqkgChUUT4bNs0fGbszm3NuB3rqiCXj27kcVWw/aqglb0qJGT77cv2gqhqSKu3BJkw7KNwkjFRYow/5ScHvh6RP1hUPEpEavIiuYZEi0cMu7cmROyZYbc8XLDry8Jpc=',
    mkUsed: mk.user.one,
    wrong: {
      msg: '0000005900000096000000c500000028000000cb000000ce00000020000000afoZAc9WPwIS3MsSe/vHGK/GhcAc9cf9s+8wsrGNKgC3dVkA1T6WpMZeUFkoBp1xwWExHtkBqplucrygjHr/uhGjjDQfE7+458c3YyNNBi0FedgUPwAUA9lmgG0n97Ij',
      mkUsed: mk.user.one,
    },
    original: [accounts.local.justTwoKeys],
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('getAccountsFromFileData cases:\n', () => {
    it('Must return local accounts', () => {
      const result = BgdAccountsUtils.getAccountsFromFileData(
        fileData.encrypted.msg,
        fileData.encrypted.password,
      );
      expect(result).toEqual(fileData.original);
    });

    it('Must return empty array', () => {
      const result = BgdAccountsUtils.getAccountsFromFileData(
        fileData.invalid.msg,
        fileData.invalid.password,
      );
      expect(result).toEqual([]);
    });

    it('Must throw an unhandled error', () => {
      try {
        BgdAccountsUtils.getAccountsFromFileData('', '');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getAccountsFromLocalStorage cases:\n', () => {
    it('Must return local accounts', async () => {
      // mocks.getValueFromLocalStorage(encrypt.msg);
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(encrypt.msg);
      const sGetValueFromLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'getValueFromLocalStorage',
      );
      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      );
      expect(sGetValueFromLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.ACCOUNTS,
      );
      expect(result).toEqual(encrypt.original);
    });

    it('Must return undefined', async () => {
      // mocks.getValueFromLocalStorage(encrypt.wrong.msg);
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(encrypt.wrong.msg);
      const sGetValueFromLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'getValueFromLocalStorage',
      );
      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      );
      expect(sGetValueFromLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.ACCOUNTS,
      );
      expect(result).toBeUndefined();
    });
  });
});
