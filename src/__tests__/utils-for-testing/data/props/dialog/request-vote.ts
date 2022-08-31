import { DefaultRpcs } from '@reference-data/default-rpc.list';
import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
import { PropsRequestVote } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: voteMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestVote,
};
