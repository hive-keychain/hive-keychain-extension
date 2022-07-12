import moment from 'moment';

const expectedResponse = [
  {
    creator: 'howo',
    dailyPay: '330 HBD',
    endDate: moment('2023-04-27T00:00:00'),
    startDate: moment('2022-04-27T00:00:00'),
    funded: 'totally_funded',
    id: 214,
    link: 'https://peakd.com/proposals/214',
    proposalId: 214,
    receiver: 'howo',
    subject: 'Core development of hive and communities year 3',
    totalVotes: '0 HP',
    voted: false,
  },
  {
    creator: 'hivewatchers',
    dailyPay: '330 HBD',
    endDate: moment('2022-07-31T00:00:00'),
    startDate: moment('2021-08-01T00:00:00'),
    funded: 'totally_funded',
    id: 185,
    link: 'https://peakd.com/proposals/185',
    proposalId: 185,
    receiver: 'hivewatchers',
    subject: 'The Hivewatchers & Spaminator Operational Proposal',
    totalVotes: '0 HP',
    voted: false,
  },
  {
    creator: 'brianoflondon',
    dailyPay: '330 HBD',
    endDate: moment('2022-05-23T00:00:00'),
    startDate: moment('2022-01-23T00:00:00'),
    funded: 'totally_funded',
    id: 201,
    link: 'https://peakd.com/proposals/201',
    proposalId: 201,
    receiver: 'v4vapp.dhf',
    subject:
      'Continuation: Hive to Value 4 Value - The Hive <> Bitcoin Lightning Bridge',
    totalVotes: '0 HP',
    voted: false,
  },
];

export default { expectedResponse };
