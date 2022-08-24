import RPCModule from '@background/rpc.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import BgdHiveUtils from '@background/utils/hive.utils';
import { Client, ExtendedAccount } from '@hiveio/dhive';
import { Manabar, RCAccount } from '@hiveio/dhive/lib/chain/rc';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import Config from 'src/config';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const initialMIN_RC_PCT = Config.claims.freeAccount.MIN_RC_PCT;
const initialSavingsDelay = Config.claims.savings.delay;

const client = new Client(DefaultRpcs[0].uri);

const toClaim = () => {
  return {
    'keychain.tests': true,
  };
};

const constants = {
  differentAccount: [{ ...accounts.local.one, name: 'theghost1980' }],
  availableSavings: [
    {
      ...accounts.extended,
      hbd_last_interest_payment: '2021-06-02 16:46:36',
      savings_hbd_seconds: '457,677,360',
      savings_hbd_balance: '3,148.720 HBD',
    },
  ],
  noAvailableSavings: [
    {
      ...accounts.extended,
      hbd_last_interest_payment: '1970-01-01 00:00:00',
      savings_hbd_seconds: '0',
      savings_hbd_balance: '0.000 HBD',
    },
  ],
  nonValidClaims: [
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
  ],
  validClaims: (claim: {
    accounts?: boolean;
    rewards?: boolean;
    savings?: boolean;
  }) => {
    return {
      __MK: mk.user.one,
      claimAccounts: claim.accounts ? toClaim() : undefined,
      claimRewards: claim.rewards ? toClaim() : undefined,
      claimSavings: claim.savings ? toClaim() : undefined,
    };
  },
  error: [
    ['startClaimAccounts: claimAccounts not defined'],
    ['startClaimRewards: claimRewards not defined'],
    ['startClaimSavings: claimSavings not defined'],
  ],
};

const mocks = {
  getMultipleValueFromLocalStorage: (values: any) =>
    (LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(values)),
  getAccounts: (extendedAccounts: ExtendedAccount[]) => {
    RPCModule.getClient = jest.fn().mockResolvedValue(client);
    client.database.getAccounts = jest.fn().mockResolvedValue(extendedAccounts);
  },
  getAccountsFromLocalStorage: (localAccounts: LocalAccount[]) =>
    (BgdAccountsUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(localAccounts)),
  rcAcc: (value: RCAccount[]) => {
    RPCModule.getClient = jest.fn().mockResolvedValue(client);
    client.rc.findRCAccounts = jest.fn().mockResolvedValue(value);
  },
  calculateRCMana: (manabar: Manabar) => {
    RPCModule.getClient = jest.fn().mockResolvedValue(client);
    client.rc.calculateRCMana = jest.fn().mockResolvedValue(manabar);
  },
  resetMin_RC: (Config.claims.freeAccount.MIN_RC_PCT = 0),
  setMaxDelay: (value: number) => (Config.claims.savings.delay = value),
};

const spies = {
  logger: {
    info: jest.spyOn(Logger, 'info'),
    error: jest.spyOn(Logger, 'error'),
  },
  create: jest.spyOn(chrome.alarms, 'create').mockReturnValue(undefined),
  claimAccounts: jest
    .spyOn(BgdHiveUtils, 'claimAccounts')
    .mockResolvedValue(undefined),
  claimRewards: jest
    .spyOn(BgdHiveUtils, 'claimRewards')
    .mockResolvedValue(true),
  claimSavings: (result: boolean | undefined) =>
    jest.spyOn(BgdHiveUtils, 'claimSavings').mockResolvedValue(result),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
    Config.claims.savings.delay = initialSavingsDelay;
  }),
  afterAll: afterAll(() => {
    Config.claims.freeAccount.MIN_RC_PCT = initialMIN_RC_PCT;
    Config.claims.savings.delay = initialSavingsDelay;
  }),
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
