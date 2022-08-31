import { DefaultRpcs } from '@reference-data/default-rpc.list';
import witnessVoteMocks from 'src/__tests__/background/requests/operations/ops/mocks/witness-vote-mocks';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { PropsRequestWitnessVote } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: witnessVoteMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
    accounts: [mk.user.one, mk.user.two],
  } as PropsRequestWitnessVote,
};
