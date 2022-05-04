//data needed to be used on some tests.

//data extended account
/* istanbul ignore next */
const dataUserExtended = {
  id: 1439151,
  name: 'workerjab1',
  owner: {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [], //['STM8X56V5jtFwmchDiDfyb4YgMfjfCVrUnPVZYkuqKuWw1ZAm3jV8', 1]
  },
  active: {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [], //['STM85Hcqk92kE1AtueigBAtHD2kZRcqji9Gi38ZaiW8xcWcQJLof6', 1]
  },
  posting: {
    weight_threshold: 1,
    account_auths: [], //['jobaboard', 1],['leofinance', 1],
    key_auths: [], //['STM7cfYmyCU6J45NjBSBUwZAV6c2ttZoNjTeaxkWSYq5HDZDWtzC3', 1]
  },
  memo_key: 'STM6mbGVeyUkC1DZUBW5wx6okDskTqGLm1VgbPCRCGyw6CPSn1VNY',
  json_metadata:
    '{"beneficiaries":[{"name":"tipu","weight":100,"label":"creator"},{"name":"hiveonboard","weight":100,"label":"provider"}]}',
  //posting_json_metadata: '',
  proxy: '',
  //previous_owner_update: '1970-01-01T00:00:00',
  last_owner_update: '1970-01-01T00:00:00',
  last_account_update: '2021-03-06T17:18:51',
  created: '2021-02-27T12:44:12',
  mined: false,
  recovery_account: 'tipu',
  last_account_recovery: '1970-01-01T00:00:00',
  reset_account: 'null',
  comment_count: 0,
  lifetime_vote_count: 0,
  post_count: 1,
  can_vote: true,
  voting_manabar: {
    current_mana: 0,
    last_update_time: 1615046820,
  },
  // downvote_manabar: {
  //   current_mana: 0,
  //   last_update_time: 1615046820,
  // },
  voting_power: 0,
  balance: '0.000 HIVE',
  savings_balance: '0.000 HIVE',
  hbd_balance: '0.001 HBD',
  hbd_seconds: '0',
  hbd_seconds_last_update: '2021-03-06T17:26:03',
  hbd_last_interest_payment: '1970-01-01T00:00:00',
  savings_hbd_balance: '0.000 HBD',
  savings_hbd_seconds: '0',
  savings_hbd_seconds_last_update: '1970-01-01T00:00:00',
  savings_hbd_last_interest_payment: '1970-01-01T00:00:00',
  savings_withdraw_requests: 0,
  reward_hbd_balance: '0.000 HBD',
  reward_hive_balance: '0.000 HIVE',
  reward_vesting_balance: '0.000000 VESTS',
  reward_vesting_hive: '0.000 HIVE',
  vesting_shares: '0.000000 VESTS',
  delegated_vesting_shares: '0.000000 VESTS',
  received_vesting_shares: '0.000000 VESTS',
  vesting_withdraw_rate: '0.000000 VESTS',
  //post_voting_power: '0.000000 VESTS',
  next_vesting_withdrawal: '1969-12-31T23:59:59',
  withdrawn: 0,
  to_withdraw: 0,
  withdraw_routes: 0,
  //pending_transfers: 0,
  curation_rewards: 0,
  posting_rewards: 0,
  proxied_vsf_votes: [0, 0, 0, 0],
  witnesses_voted_for: 5,
  last_post: '2021-03-06T16:06:03',
  last_root_post: '1970-01-01T00:00:00',
  last_vote_time: '2021-03-06T16:07:00',
  //post_bandwidth: 0,
  //pending_claimed_accounts: 0,
  //governance_vote_expiration_ts: '2022-07-12T12:38:15',
  //delayed_votes: [],
  //open_recurrent_transfers: 0,
  vesting_balance: '0.000 HIVE',
  reputation: 0,
  transfer_history: [],
  market_history: [],
  post_history: [],
  vote_history: [],
  other_history: [],
  witness_votes: [
    'aggroed',
    'blocktrades',
    'drakos',
    'someguy123',
    'therealwolf',
  ],
  tags_usage: [],
  guest_bloggers: [],
};

const utilsT = {
  dataUserExtended,
};

export default utilsT;
