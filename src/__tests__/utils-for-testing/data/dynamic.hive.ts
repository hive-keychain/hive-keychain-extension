import { DynamicGlobalProperties, Price } from '@hiveio/dhive';
import { RewardFund } from '@interfaces/global-properties.interface';

const globalProperties = {
  id: 1200,
  confidential_supply: '1.00',
  confidential_hbd_supply: '1.00',
  average_block_size: 1,
  max_virtual_bandwidth: '1',
  current_reserve_ratio: 1,
  head_block_number: 64067452,
  head_block_id: '03d1977cbc6ba55ad67452936e3498d1aa2f8b7f',
  time: '2022-05-04T02:19:06',
  current_witness: 'ocd-witness',
  total_pow: 514415,
  num_pow_witnesses: 172,
  virtual_supply: '410954159.915 HIVE',
  current_supply: '379292312.644 HIVE',
  init_hbd_supply: '0.000 HBD',
  current_hbd_supply: '25044521.192 HBD',
  total_vesting_fund_hive: '154736550.692 HIVE',
  total_vesting_shares: '283471198739.626565 VESTS',
  total_reward_fund_hive: '0.000 HIVE',
  total_reward_shares2: '0',
  pending_rewarded_vesting_shares: '755676344.919476 VESTS',
  pending_rewarded_vesting_hive: '389377.969 HIVE',
  hbd_interest_rate: 2000,
  hbd_print_rate: 10000,
  maximum_block_size: 65536,
  required_actions_partition_percent: 0,
  current_aslot: 64265182,
  recent_slots_filled: '340282366920938463463374607431768211455',
  participation_count: 128,
  last_irreversible_block_num: 64067436,
  vote_power_reserve_rate: 10,
  delegation_return_period: 432000,
  reverse_auction_seconds: 0,
  available_account_subsidies: 14129994,
  hbd_stop_percent: 1000,
  hbd_start_percent: 900,
  next_maintenance_time: '2022-05-04T02:34:06',
  last_budget_time: '2022-05-04T01:34:06',
  next_daily_maintenance_time: '2022-05-04T19:31:30',
  content_reward_percent: 6500,
  vesting_reward_percent: 1500,
  sps_fund_percent: 1000,
  sps_interval_ledger: '200.031 HBD',
  downvote_pool_percent: 2500,
  current_remove_threshold: 200,
  early_voting_seconds: 86400,
  mid_voting_seconds: 172800,
  max_consecutive_recurrent_transfer_failures: 10,
  max_recurrent_transfer_end_date: 730,
  min_recurrent_transfers_recurrence: 24,
  max_open_recurrent_transfers: 255,
} as DynamicGlobalProperties;

const medianHistoryPrice = {
  base: { amount: 0.512, symbol: 'HBD' },
  quote: { amount: 1, symbol: 'HIVE' },
} as Price;

const rewardFund = {
  id: 0,
  name: 'post',
  reward_balance: '812003.905 HIVE',
  recent_claims: '621874018445293967',
  last_update: '2022-05-25T16:01:36',
  content_constant: '2000000000000',
  percent_curation_rewards: 5000,
  percent_content_rewards: 10000,
  author_reward_curve: 'linear',
  curation_reward_curve: 'linear',
} as RewardFund;

const dynamic = {
  globalProperties,
  medianHistoryPrice,
  rewardFund,
};

export default dynamic;
