import { ExtendedAccount } from '@hiveio/dhive';
import HiveUtils from 'src/utils/hive.utils';

const extraMocks = {
  getAccounts: (result: ExtendedAccount[]) => {
    HiveUtils.getClient().database.getAccounts = jest
      .fn()
      .mockResolvedValue(result);
  },
};

export default { extraMocks };
