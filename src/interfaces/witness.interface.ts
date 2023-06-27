export interface Witness {
  name: string;
  rank?: string;
  active_rank?: string;
  votes?: number;
  votes_count?: number;
  signing_key?: string;
  url?: string;
}

export interface WitnessParams {
  accountCreationFee: number;
  accountCreationFeeFormatted: string;
  maximumBlockSize: number;
  hbdInterestRate: number;
}
export interface WitnessInfo {
  username: string;
  votesCount: number;
  voteValueInHP: string;
  blockMissed: number;
  lastBlock: string;
  lastBlockUrl: string;
  priceFeed: string;
  priceFeedUpdatedAt: moment.Moment;
  priceFeedUpdatedAtWarning: boolean;

  signingKey: string;
  url: string;
  version: string;
  isDisabled: boolean;
  params: WitnessParams;
  rewards: {
    lastMonthValue: number;
    lastMonthInHP: string;
    lastMonthInUSD: string;
    lastWeekValue: number;
    lastWeekInHP: string;
    lastWeekInUSD: string;
    lastYearValue: number;
    lastYearInHP: string;
    lastYearInUSD: string;
  };
}

export interface WitnessParamsForm {
  accountCreationFee: number;
  maximumBlockSize: number;
  hbdInterestRate: number;
  signingKey: string;
  url: string;
}

export type WitnessFormField = keyof WitnessParamsForm;

export interface LastSigningKeys {
  [username: string]: string;
}
