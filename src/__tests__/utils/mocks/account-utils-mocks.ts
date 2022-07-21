import { ExtendedAccount } from '@hiveio/dhive';
import AccountUtils from 'src/utils/account.utils';

const extraMocks = {
  getAccounts: (result: ExtendedAccount[]) => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue(result);
    // HiveUtils.getClient().database.getAccounts = jest
    //   .fn()
    //   .mockResolvedValue(result);
  },
};

export default { extraMocks };
