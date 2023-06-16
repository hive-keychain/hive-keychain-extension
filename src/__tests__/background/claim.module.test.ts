import ClaimModule from '@background/claim.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import { Client } from '@hiveio/dhive';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import Config from 'src/config';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { SavingsUtils } from 'src/utils/savings.utils';

describe('claim.module tests:\n', () => {
  const initialMIN_RC_PCT = Config.claims.freeAccount.MIN_RC_PCT;
  const initialSavingsDelay = Config.claims.savings.delay;
  const client = new Client(DefaultRpcs[0].uri);

  afterAll(() => {
    Config.claims.freeAccount.MIN_RC_PCT = initialMIN_RC_PCT;
    Config.claims.savings.delay = initialSavingsDelay;
  }),
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
      jest.restoreAllMocks();
      jest.resetAllMocks();
      Config.claims.savings.delay = initialSavingsDelay;
    });

  it('Must create alarm and call Logger', async () => {
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        __MK: undefined,
        claimAccounts: undefined,
        claimRewards: undefined,
        claimSavings: undefined,
      });
    const sLoggerInfo = jest.spyOn(Logger, 'info');
    const sCreate = jest
      .spyOn(chrome.alarms, 'create')
      .mockReturnValue(undefined);
    await ClaimModule.start();
    expect(sLoggerInfo).toBeCalledWith(
      `Will autoclaim every ${Config.claims.FREQUENCY}mn`,
    );
    expect(sCreate).toBeCalledWith({
      periodInMinutes: Config.claims.FREQUENCY,
    });
  });

  it('Must call Logger with error on each case', async () => {
    const nonValidClaims = [
      {
        __MK: mk.user.one,
        claimAccounts: [],
        claimRewards: ['hi there'],
        claimSavings: [{ key: 1 }],
      },
      {
        __MK: mk.user.one,
        claimAccounts: 'not object',
        claimRewards: 'not object',
        claimSavings: 'not object',
      },
    ];
    const sLoggerError = jest.spyOn(Logger, 'error');
    for (let i = 0; i < nonValidClaims.length; i++) {
      LocalStorageUtils.getMultipleValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(nonValidClaims[i]);
      await ClaimModule.start();
      expect(sLoggerError).toHaveBeenNthCalledWith(
        1,
        'startClaimAccounts: claimAccounts not defined',
      );
      expect(sLoggerError).toHaveBeenNthCalledWith(
        2,
        'startClaimRewards: claimRewards not defined',
      );
      expect(sLoggerError).toHaveBeenNthCalledWith(
        3,
        'startClaimSavings: claimSavings not defined',
      );
      sLoggerError.mockReset();
    }
  });

  it('Must call logger with nothing to claim', async () => {
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        __MK: mk.user.one,
        claimAccounts: undefined,
        claimRewards: undefined,
        claimSavings: { 'keychain.tests': true },
      });
    AccountUtils.getExtendedAccounts = jest.fn().mockResolvedValue([
      {
        ...accounts.extended,
        hbd_last_interest_payment: '1970-01-01 00:00:00',
        savings_hbd_seconds: '0',
        savings_hbd_balance: '0.000 HBD',
      },
    ]);
    BgdAccountsUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue([accounts.local.justTwoKeys]);
    client.rc.calculateRCMana = jest.fn().mockResolvedValue(accounts.active.rc);
    const sLoggerInfo = jest.spyOn(Logger, 'info');
    const sClaimSavings = jest.spyOn(SavingsUtils, 'claimSavings');
    await ClaimModule.start();
    expect(sLoggerInfo).toHaveBeenNthCalledWith(
      2,
      `@${accounts.active.name} doesn't have any savings interests to claim`,
    );
    expect(sClaimSavings).not.toBeCalled();
  });

  it('Must call logger with no time to claim', async () => {
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        __MK: mk.user.one,
        claimAccounts: undefined,
        claimRewards: undefined,
        claimSavings: { 'keychain.tests': true },
      });
    AccountUtils.getExtendedAccounts = jest.fn().mockResolvedValue([
      {
        ...accounts.extended,
        hbd_last_interest_payment: '2021-06-02 16:46:36',
        savings_hbd_seconds: '457,677,360',
        savings_hbd_balance: '3,148.720 HBD',
      },
    ]);
    BgdAccountsUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue([accounts.local.justTwoKeys]);
    client.rc.calculateRCMana = jest.fn().mockResolvedValue(accounts.active.rc);
    Config.claims.savings.delay = 1000000000;
    const sLoggerInfo = jest.spyOn(Logger, 'info');
    const sClaimSavings = jest.spyOn(SavingsUtils, 'claimSavings');
    await ClaimModule.start();
    expect(sLoggerInfo).toHaveBeenNthCalledWith(
      2,
      `Not time to claim yet for @${accounts.active.name}`,
    );
    expect(sClaimSavings).not.toBeCalled();
  });
});
