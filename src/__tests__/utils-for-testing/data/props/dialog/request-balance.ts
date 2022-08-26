import { DefaultRpcs } from '@reference-data/default-rpc.list';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { PropsRequestBalance } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    amount: 1000,
    currency: 'HIVE',
    username: mk.user.one,
    rpc: DefaultRpcs[0],
  } as PropsRequestBalance,
};
