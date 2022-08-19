import RPCModule from '@background/rpc.module';
import { Asset, Client } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import * as Config from 'src/config';
import Logger from 'src/utils/logger.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import confirmations from 'src/__tests__/utils-for-testing/data/confirmations';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import { KeyToUseNoMaster } from 'src/__tests__/utils-for-testing/enums/enums';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import {
  ClaimAccountsParams,
  ClaimRewardsParams,
} from 'src/__tests__/utils-for-testing/interfaces/params';

const constants = {
  client: new Client(DefaultRpcs[0].uri),
};

const mocks = {
  //   getValueFromLocalStorage: (_accountsEnc: string) =>
  //     (LocalStorageUtils.getValueFromLocalStorage = jest
  //       .fn()
  //       .mockResolvedValue(_accountsEnc)),
  getClient: (client?: Client) =>
    (RPCModule.getClient = jest.fn().mockResolvedValue(client)),
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
  //   getValueFromLocalStorage: () =>
  //     jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage'),
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
    property: 'hbd_balance' | 'savings_hbd_balance',
    asAsset?: boolean,
  ) => {
    const clonedActiveAccount = objects.clone(accounts.active) as ActiveAccount;
    clonedActiveAccount.account[property] = asAsset
      ? new Asset(0, 'HBD')
      : '0.000 HBD';
    return clonedActiveAccount;
  },
};

const errorClaimRewards = [
  {
    description: 'undefined Client returned',
    params: {
      activeAccount: accounts.active,
      rewardHive: new Asset(1000, 'HIVE'),
      rewardHBD: new Asset(1000, 'HBD'),
      rewardVests: new Asset(1000, 'VESTS'),
    } as ClaimRewardsParams,
    mocks: () => {
      mocks.getClient(undefined);
    },
  },
  {
    description: 'No posting key on active account',
    params: {
      activeAccount: method.removeKey(
        KeyToUseNoMaster.POSTING,
        accounts.active,
      ),
      rewardHive: new Asset(1000, 'HIVE'),
      rewardHBD: new Asset(1000, 'HBD'),
      rewardVests: new Asset(1000, 'VESTS'),
    } as ClaimRewardsParams,
    mocks: () => {
      mocks.getClient(constants.client);
      mocks.sendOperations;
    },
  },
];

const errorClaimAccounts = [
  {
    description: 'Not enough RC% to claim account',
    params: {
      rc: manabar,
      activeAccount: accounts.active,
    } as ClaimAccountsParams,
    mocks: () => {
      //mocks.getClient(undefined);
    },
    spies: {
      using: spies.logger.info,
    },
  },
  {
    description: new TypeError(
      "Cannot read properties of undefined (reading 'broadcast')",
    ),
    params: {
      rc: manabar,
      activeAccount: accounts.active,
    } as ClaimAccountsParams,
    mocks: () => {
      mocks.getClient(undefined);
      mocks.setConfigAsMin();
    },
    spies: {
      using: spies.logger.error,
    },
  },
  {
    description: new TypeError('Expected String'),
    params: {
      rc: manabar,
      activeAccount: method.removeKey(
        KeyToUseNoMaster.ACTIVE,
        accounts.active,
      ) as ActiveAccount,
    } as ClaimAccountsParams,
    mocks: () => {
      mocks.getClient(constants.client);
      mocks.setConfigAsMin();
      mocks.sendOperations;
    },
    spies: {
      using: spies.logger.error,
    },
  },
];

export default {
  constants,
  mocks,
  spies,
  method,
  errorClaimRewards,
  errorClaimAccounts,
};
