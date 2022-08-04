import { KeyValue } from 'src/__tests__/utils-for-testing/interfaces/mocksData';

const filtersLengths = {
  lengths: {
    transfer: 1,
    claim_reward_balance: 1,
    delegate_vesting_shares: 1,
    claim_account: 1,
    savings: 3,
    power_up_down: 2,
    convert: 4,
  } as KeyValue,
  in: {
    transfer: 1,
    claim_reward_balance: 1,
    claim_account: 1,
    savings: 3,
    power_up_down: 2,
    convert: 4,
  } as KeyValue,
  out: {
    transfer: 0,
    claim_reward_balance: 1,
    claim_account: 1,
    savings: 3,
    power_up_down: 2,
    convert: 4,
  } as KeyValue,
};

export default { filtersLengths };
