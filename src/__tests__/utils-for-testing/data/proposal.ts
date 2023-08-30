import { Asset } from '@hiveio/dhive';
import { Proposal } from '@interfaces/proposal.interface';
import moment from 'moment';

const expectedResponse = [
  {
    creator: 'howo',
    dailyPay: Asset.fromString('330 HBD'),
    endDate: moment('2023-04-27T00:00:00'),
    startDate: moment('2022-04-27T00:00:00'),
    funded: 'totally_funded',
    id: 214,
    link: 'https://peakd.com/proposals/214',
    proposalId: 214,
    receiver: 'howo',
    subject: 'Core development of hive and communities year 3',
    totalVotes: '10 HP',
    voted: false,
  },
  {
    creator: 'hivewatchers',
    dailyPay: Asset.fromString('330 HBD'),
    endDate: moment('2022-07-31T00:00:00'),
    startDate: moment('2021-08-01T00:00:00'),
    funded: 'totally_funded',
    id: 185,
    link: 'https://peakd.com/proposals/185',
    proposalId: 185,
    receiver: 'hivewatchers',
    subject: 'The Hivewatchers & Spaminator Operational Proposal',
    totalVotes: '20 HP',
    voted: false,
  },
  {
    creator: 'brianoflondon',
    dailyPay: Asset.fromString('330 HBD'),
    endDate: moment('2022-05-23T00:00:00'),
    startDate: moment('2022-01-23T00:00:00'),
    funded: 'totally_funded',
    id: 201,
    link: 'https://peakd.com/proposals/201',
    proposalId: 201,
    receiver: 'v4vapp.dhf',
    subject:
      'Continuation: Hive to Value 4 Value - The Hive <> Bitcoin Lightning Bridge',
    totalVotes: '30 HP',
    voted: false,
  },
];

const fakeVotedAccountResponse = [
  {
    id: 90661,
    voter: 'theghost1980',
    proposal: {
      id: 216,
      proposal_id: 216,
      creator: 'keychain',
      receiver: 'keychain',
      start_date: '2022-05-15T00:00:00',
      end_date: '2023-05-15T00:00:00',
      daily_pay: [Object],
      subject: 'Hive Keychain development',
      permlink: 'hive-keychain-proposal-dhf-ran717',
      total_votes: '61237185339413554',
      status: 'active',
    },
  },
];

const fakeProposalListResponse = {
  proposals: [
    {
      id: 214,
      proposal_id: 214,
      creator: 'howo',
      receiver: 'howo',
      start_date: '2022-04-27T00:00:00',
      end_date: '2023-04-27T00:00:00',
      daily_pay: { amount: '330000', precision: 3, nai: '@@000000013' },
      subject: 'Core development of hive and communities year 3',
      permlink: 'core-development-proposal-year-3',
      total_votes: '84323179888178111',
      status: 'active',
    },
    {
      id: 185,
      proposal_id: 185,
      creator: 'hivewatchers',
      receiver: 'hivewatchers',
      start_date: '2021-08-01T00:00:00',
      end_date: '2022-07-31T00:00:00',
      daily_pay: { amount: '330000', precision: 3, nai: '@@000000013' },
      subject: 'The Hivewatchers & Spaminator Operational Proposal',
      permlink: 'the-hivewatchers-and-spaminator-operational-proposal',
      total_votes: '74818760284017953',
      status: 'active',
    },
    {
      id: 201,
      proposal_id: 201,
      creator: 'brianoflondon',
      receiver: 'v4vapp.dhf',
      start_date: '2022-01-23T00:00:00',
      end_date: '2022-05-23T00:00:00',
      daily_pay: { amount: '330000', precision: 3, nai: '@@000000013' },
      subject:
        'Continuation: Hive to Value 4 Value - The Hive <> Bitcoin Lightning Bridge',
      permlink:
        'v4vapp-updates-ongoing-funding-proposal-for-the-btc-lightning-to-hive-bi-directional-bridge',
      total_votes: '73774153416233168',
      status: 'active',
    },
  ],
};

const fakeProposalListResponseHiveTx = {
  proposals: [
    {
      id: 214,
      proposal_id: 214,
      creator: 'howo',
      receiver: 'howo',
      start_date: '2022-04-27T00:00:00',
      end_date: '2023-04-27T00:00:00',
      daily_pay: '330.000 HBD',
      subject: 'Core development of hive and communities year 3',
      permlink: 'core-development-proposal-year-3',
      total_votes: '84323179888178111',
      status: 'active',
    },
    {
      id: 185,
      proposal_id: 185,
      creator: 'hivewatchers',
      receiver: 'hivewatchers',
      start_date: '2021-08-01T00:00:00',
      end_date: '2022-07-31T00:00:00',
      daily_pay: '330.000 HBD',
      subject: 'The Hivewatchers & Spaminator Operational Proposal',
      permlink: 'the-hivewatchers-and-spaminator-operational-proposal',
      total_votes: '74818760284017953',
      status: 'active',
    },
    {
      id: 201,
      proposal_id: 201,
      creator: 'brianoflondon',
      receiver: 'v4vapp.dhf',
      start_date: '2022-01-23T00:00:00',
      end_date: '2022-05-23T00:00:00',
      daily_pay: '330.000 HBD',
      subject:
        'Continuation: Hive to Value 4 Value - The Hive <> Bitcoin Lightning Bridge',
      permlink:
        'v4vapp-updates-ongoing-funding-proposal-for-the-btc-lightning-to-hive-bi-directional-bridge',
      total_votes: '73774153416233168',
      status: 'active',
    },
  ],
};

const fakeProposalKeyChain = {
  id: 216,
  proposal_id: 216,
  creator: 'keychain',
  receiver: 'keychain',
  start_date: '2022-05-15T00:00:00',
  end_date: '2023-05-15T00:00:00',
  daily_pay: { amount: '390000', precision: 3, nai: '@@000000013' },
  subject: 'Hive Keychain development',
  permlink: 'hive-keychain-proposal-dhf-ran717',
  total_votes: '61237185339413554',
  status: 'active',
};

const fakeProposalKeyChainHiveTx = {
  id: 216,
  proposal_id: 216,
  creator: 'keychain',
  receiver: 'keychain',
  start_date: '2022-05-15T00:00:00',
  end_date: '2023-05-15T00:00:00',
  daily_pay: '390 HBD',
  subject: 'Hive Keychain development',
  permlink: 'hive-keychain-proposal-dhf-ran717',
  total_votes: '61237185339413554',
  status: 'active',
};

const fakeProposal2 = {
  id: 140,
  proposal_id: 140,
  creator: 'keychain',
  receiver: 'keychain',
  start_date: '2020-11-15T00:00:00',
  end_date: '2021-05-15T00:00:00',
  daily_pay: { amount: '200000', precision: 3, nai: '@@000000013' },
  subject: 'Hive Keychain Development #2',
  permlink: 'hive-keychain-development-proposal-2',
  total_votes: '50549679283763983',
  status: 'expired',
};

const fakeListProposalVotesResponse = [
  { id: 90661, voter: 'theghost1980', proposal: fakeProposalKeyChain },
  { id: 72478, voter: 'thefukel', proposal: fakeProposal2 },
  { id: 80828, voter: 'theflamingwings', proposal: fakeProposal2 },
  { id: 83430, voter: 'thefiery', proposal: fakeProposal2 },
];

const fakeDailyBudgetResponse = 16259983.208;

const expectedResultProposal = [
  {
    creator: 'howo',
    dailyPay: Asset.fromString('330 HBD'),
    endDate: moment('2023-04-27T00:00:00'),
    startDate: moment('2022-04-27T00:00:00'),
    funded: 'totally_funded',
    id: 214,
    link: 'https://peakd.com/proposals/214',
    proposalId: 214,
    receiver: 'howo',
    subject: 'Core development of hive and communities year 3',
    totalVotes: '46.03M HP',
    voted: false,
  },
  {
    creator: 'hivewatchers',
    dailyPay: Asset.fromString('330 HBD'),
    endDate: moment('2022-07-31T00:00:00'),
    startDate: moment('2021-08-01T00:00:00'),
    funded: 'totally_funded',
    id: 185,
    link: 'https://peakd.com/proposals/185',
    proposalId: 185,
    receiver: 'hivewatchers',
    subject: 'The Hivewatchers & Spaminator Operational Proposal',
    totalVotes: '40.84M HP',
    voted: false,
  },
  {
    creator: 'brianoflondon',
    dailyPay: Asset.fromString('330 HBD'),
    endDate: moment('2022-05-23T00:00:00'),
    startDate: moment('2022-01-23T00:00:00'),
    funded: 'totally_funded',
    id: 201,
    link: 'https://peakd.com/proposals/201',
    proposalId: 201,
    receiver: 'v4vapp.dhf',
    subject:
      'Continuation: Hive to Value 4 Value - The Hive <> Bitcoin Lightning Bridge',
    totalVotes: '40.27M HP',
    voted: false,
  },
] as Proposal[];

export default {
  expectedResponse,
  fakeVotedAccountResponse,
  fakeProposalListResponse,
  fakeProposalListResponseHiveTx,
  fakeDailyBudgetResponse,
  fakeListProposalVotesResponse,
  fakeProposal2,
  fakeProposalKeyChain,
  expectedResultProposal,
  fakeProposalKeyChainHiveTx,
};
