import BgdAccountsUtils from '@background/utils/accounts.utils';
import { Client, ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { HiveTxConfirmationResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import Config from 'src/config';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { RewardsUtils } from 'src/utils/rewards.utils';
import { SavingsUtils } from 'src/utils/savings.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { transactionConfirmationSuccess } from 'src/__tests__/utils-for-testing/data/confirmations';
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
  rcAccountData: {
    account: 'keychain.tests',
    rc_manabar: {
      current_mana: 1000000,
      max_mana: 10000000,
      percentage: 100,
    } as Manabar,
    max_rc_creation_adjustment: [],
    max_rc: '58156907628',
    delegated_rc: 0,
    received_delegated_rc: 0,
    percentage: 100,
  },
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
  getExtendedAccounts: (accounts: ExtendedAccount[]) =>
    (AccountUtils.getExtendedAccounts = jest.fn().mockResolvedValue(accounts)),
  getAccountsFromLocalStorage: (localAccounts: LocalAccount[]) =>
    (BgdAccountsUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(localAccounts)),
  getRCMana: (rcAccount: any) =>
    (AccountUtils.getRCMana = jest.fn().mockResolvedValue(rcAccount)),
  calculateRCMana: (manabar: Manabar) => {
    // RPCModule.getClient = jest.fn().mockResolvedValue(client);
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
    .spyOn(AccountUtils, 'claimAccounts')
    .mockResolvedValue(undefined),
  claimRewards: jest
    .spyOn(RewardsUtils, 'claimRewards')
    .mockResolvedValue(transactionConfirmationSuccess),
  claimSavings: (result: HiveTxConfirmationResult) =>
    jest.spyOn(SavingsUtils, 'claimSavings').mockResolvedValue(result),
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
