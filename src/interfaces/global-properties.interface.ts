import type { DynamicGlobalProperties, Price } from '@hiveio/dhive';

export interface RewardFund {
  author_reward_curve: string;
  content_constant: string;
  curation_reward_curve: string;
  id: number;
  last_update: string;
  name: string;
  percent_content_rewards: number;
  percent_curation_rewards: number;
  recent_claims: string;
  reward_balance: string;
}
export interface GlobalProperties {
  globals?: DynamicGlobalProperties;
  price?: Price;
  rewardFund?: RewardFund;
}
