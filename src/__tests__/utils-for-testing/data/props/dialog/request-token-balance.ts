import mk from 'src/__tests__/utils-for-testing/data/mk';
import { PropsRequestTokenBalance } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    amount: 1,
    currency: 'LEO',
    username: mk.user.one,
    hiveEngineConfig: {
      rpc: 'https://api.hive-engine.com/rpc',
      mainnet: 'ssc-mainnet-hive',
      accountHistoryApi: 'https://history.hive-engine.com/',
    },
  } as PropsRequestTokenBalance,
};
