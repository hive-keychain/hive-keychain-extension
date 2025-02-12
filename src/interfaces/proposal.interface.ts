import type { Asset } from '@hiveio/dhive';

export enum FundedOption {
  TOTALLY_FUNDED = 'totally_funded',
  PARTIALLY_FUNDED = 'partially_funded',
  NOT_FUNDED = 'not_funded',
}
export interface Proposal {
  id: number;
  creator: string;
  dailyPay: Asset;
  startDate: moment.Moment;
  endDate: moment.Moment;
  receiver: string;
  status: string;
  totalVotes: string;
  subject: string;
  link: string;
  proposalId: number;
  voted: boolean;
  funded: FundedOption;
}
