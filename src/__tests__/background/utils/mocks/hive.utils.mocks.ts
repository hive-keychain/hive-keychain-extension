import { Asset, Client } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import * as Config from 'src/config';
import Logger from 'src/utils/logger.utils';
import { SavingsUtils } from 'src/utils/savings.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import confirmations from 'src/__tests__/utils-for-testing/data/confirmations';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import { KeyToUseNoMaster } from 'src/__tests__/utils-for-testing/enums/enums';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { BalancesTypes } from 'src/__tests__/utils-for-testing/types/balances-types';

const constants = {
  client: new Client(DefaultRpcs[0].uri),
  tuple: {
    assets: {
      _string: [accounts.active, '1000', '1000', '10000000'] as const,
    },
    claimAccounts: [manabar, accounts.active] as const,
  },
  noPendings: `@${accounts.active.name} has no HBD to deposit or savings to withdraw`,
};

const mocks = {
  // getClient: (client?: Client) =>
  //   (RPCModule.getClient = jest.fn().mockResolvedValue(client)),
  sendOperations: (constants.client.broadcast.sendOperations = jest
    .fn()
    .mockResolvedValue(confirmations.trx)),
  setConfigAsMin: () =>
    (Config.default.claims.freeAccount = {
      MIN_RC_PCT: 0,
      MIN_RC: 0,
    }),
};

const spies = {
  logger: {
    info: jest.spyOn(Logger, 'info'),
    error: jest.spyOn(Logger, 'error'),
  },
};

const method = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  removeKey: (key: KeyToUseNoMaster, activeAccount: ActiveAccount) => {
    const clonedActiveAccount = objects.clone(activeAccount) as ActiveAccount;
    delete clonedActiveAccount.keys[key];
    delete clonedActiveAccount.keys[`${key}Pubkey`];
    return clonedActiveAccount;
  },
  reset: (
    property: BalancesTypes,
    activeAccount: ActiveAccount,
    asAsset?: boolean,
  ) => {
    const clonedActiveAccount = objects.clone(activeAccount) as ActiveAccount;
    clonedActiveAccount.account[property] = asAsset
      ? new Asset(0, 'HBD')
      : '0.000 HBD';
    return clonedActiveAccount;
  },
  assertErrors: async (usingBalance: BalancesTypes) => {
    for (let i = 0; i < errorClaimSavings.length; i++) {
      const element = errorClaimSavings[i];
      const { mocks, spies, param } = element;
      mocks();
      const activeAccount = method.reset(usingBalance, param);
      expect(await SavingsUtils.claimSavings(activeAccount)).toBe(false);
      const { calls } = spies.using.mock;
      expect(calls[0][0]).toBe(
        `Error while claiming savings for @${accounts.active.name}`,
      );
      spies.using.mockReset();
    }
  },
  resetBothBalances: (activeAccount: ActiveAccount) => {
    const clonedActiveAccount = objects.clone(activeAccount) as ActiveAccount;
    clonedActiveAccount.account.hbd_balance = '0.000 HBD';
    clonedActiveAccount.account.savings_hbd_balance = new Asset(0, 'HBD');
    return clonedActiveAccount;
  },
};

const errorClaimSavings = [
  {
    description: 'undefined Client returned',
    mocks: () => {
      // mocks.getClient(undefined); // TODO Fix
    },
    param: accounts.active as ActiveAccount,
    spies: {
      using: spies.logger.error,
      callingParams: [
        `Error while claiming savings for @${accounts.active.name}`,
        new TypeError("Cannot read property 'broadcast' of undefined"),
      ],
    },
  },
  {
    description: 'No active key on activeAccount',
    param: method.removeKey(
      KeyToUseNoMaster.ACTIVE,
      accounts.active,
    ) as ActiveAccount,
    mocks: () => {
      // mocks.getClient(constants.client); TODO fix
      mocks.sendOperations;
    },
    spies: {
      using: spies.logger.error,
      callingParams: [
        `Error while claiming savings for @${accounts.active.name}`,
        new TypeError('Expected String'),
      ],
    },
  },
];

export default {
  constants,
  mocks,
  spies,
  method,
};
