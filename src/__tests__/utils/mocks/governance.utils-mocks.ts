import { ExtendedAccount } from '@hiveio/dhive';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import { transactionConfirmationSuccess } from 'src/__tests__/utils-for-testing/data/confirmations';

const constants = {
  extendedAccountsResponse: [
    {
      name: 'account1',
      governance_vote_expiration_ts: '2022-06-28T02:02:33',
    },
    {
      name: 'account2',
      governance_vote_expiration_ts: '2023-07-28T02:02:33',
    },
    {
      name: 'account3',
      governance_vote_expiration_ts: '2022-07-28T02:02:33',
    },
    {
      name: 'account4',
      governance_vote_expiration_ts: '2022-06-28T02:02:33',
    },
    {
      name: 'account5',
      governance_vote_expiration_ts: '2023-07-28T02:02:33',
    },
    {
      name: 'account6',
      governance_vote_expiration_ts: '2022-07-28T02:02:33',
    },
    {
      name: 'account7',
      governance_vote_expiration_ts: '2022-06-28T02:02:33',
    },
    {
      name: 'account8',
      governance_vote_expiration_ts: '2023-07-28T02:02:33',
    },
    {
      name: 'account9',
      governance_vote_expiration_ts: '2022-07-28T02:02:33',
    },
  ],
  renewalIgnored: {
    account1: '2021-05-22T00:00:00',
    account2: '2021-05-22T00:00:00',
    account3: '2021-05-22T00:00:00',
    account4: '2022-05-22T00:00:00',
    account5: '2022-05-22T00:00:00',
    account6: '2022-05-22T00:00:00',
  },
  reminderList: [
    'account1',
    'account2',
    'account3',
    'account4',
    'account5',
    'account6',
    'account7',
    'account8',
    'account9',
  ],
};

const mocks = {
  getValueFromLocalStorage: (value: any) =>
    (LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(value)),
  getExtendedAccounts: (extendedAccounts: ExtendedAccount[]) =>
    (AccountUtils.getExtendedAccounts = jest
      .fn()
      .mockResolvedValue(extendedAccounts)),
};

const spies = {
  saveValueInLocalStorage: jest
    .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
    .mockImplementation((...args) => Promise.resolve(undefined)),
  ProposalUtils: {
    unvoteProposal: jest
      .spyOn(ProposalUtils, 'unvoteProposal')
      .mockImplementation((...args) => {
        return Promise.resolve(transactionConfirmationSuccess);
      }),
    voteProposal: jest
      .spyOn(ProposalUtils, 'voteForProposal')
      .mockImplementation((...args) => {
        return Promise.resolve(transactionConfirmationSuccess);
      }),
  },
  logger: {
    error: jest.spyOn(Logger, 'error'),
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.resetAllMocks();
  }),
};

export default { constants, mocks, spies, methods };
