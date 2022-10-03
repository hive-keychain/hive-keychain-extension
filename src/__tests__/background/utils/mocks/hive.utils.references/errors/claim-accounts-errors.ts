import { ActiveAccount } from '@interfaces/active-account.interface';
import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import { KeyToUseNoMaster } from 'src/__tests__/utils-for-testing/enums/enums';
const { mocks, method, constants, spies } = hiveUtilsMocks;

export const errorClaimAccounts = [
  {
    description: 'Not enough RC% to claim account',
    params: constants.tuple.claimAccounts,
    mocks: () => {},
    spies: {
      using: spies.logger.info,
    },
  },
  {
    description: new TypeError("Cannot read property 'broadcast' of undefined"),
    params: constants.tuple.claimAccounts,
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
    params: [
      manabar,
      method.removeKey(
        KeyToUseNoMaster.ACTIVE,
        accounts.active,
      ) as ActiveAccount,
    ] as const,
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
