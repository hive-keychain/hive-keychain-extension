import {
  AccountAuthorities,
  AccountCreationType,
  GeneratedKeys,
} from 'src/utils/account-creation.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const constants = {
  creationType: {
    buying: AccountCreationType.BUYING,
    usingTicket: AccountCreationType.USING_TICKET,
  },
  newAccountName: 'newAccount',
  accountAuthorities: {
    active: accounts.extended.active,
    posting: accounts.extended.posting,
  } as AccountAuthorities,
  generatedKeys: {
    active: {
      private: userData.one.nonEncryptKeys.active,
      public: userData.one.encryptKeys.active,
    },
    posting: {
      private: userData.one.nonEncryptKeys.posting,
      public: userData.one.encryptKeys.posting,
    },
    memo: {
      private: userData.one.nonEncryptKeys.memo,
      public: userData.one.encryptKeys.memo,
    },
  } as GeneratedKeys,
};

const methods = {
  afterAll: afterAll(() => {
    jest.clearAllMocks();
  }),
};

export default { constants, methods };
