import { Asset } from '@hiveio/dhive';
import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { KeyToUseNoMaster } from 'src/__tests__/utils-for-testing/enums/enums';
const { mocks, method, constants } = hiveUtilsMocks;

export const errorClaimRewards = [
  {
    description: 'undefined Client returned',
    params: [
      accounts.active,
      new Asset(1000, 'HIVE'),
      new Asset(1000, 'HBD'),
      new Asset(1000, 'VESTS'),
    ] as const,
    mocks: () => {
      mocks.getClient(undefined);
    },
  },
  {
    description: 'No posting key on active account',
    params: [
      method.removeKey(KeyToUseNoMaster.POSTING, accounts.active),
      new Asset(1000, 'HIVE'),
      new Asset(1000, 'HBD'),
      new Asset(1000, 'VESTS'),
    ] as const,
    mocks: () => {
      mocks.getClient(constants.client);
      mocks.sendOperations;
    },
  },
];
