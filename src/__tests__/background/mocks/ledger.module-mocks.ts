import { SignFromLedgerRequestMessage } from 'src/dialog/pages/sign-transaction';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const data: SignFromLedgerRequestMessage = {
  transaction: {
    ref_block_num: 1,
    ref_block_prefix: 1,
    expiration: '11221112',
    operations: [],
    extensions: [],
  },
  key: userData.one.nonEncryptKeys.posting,
};

const spies = {
  sendMessage: jest
    .spyOn(chrome.runtime, 'sendMessage')
    .mockReturnValue(undefined),
};

export default { data, spies };
