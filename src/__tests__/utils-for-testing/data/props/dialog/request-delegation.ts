import { DefaultRpcs } from '@reference-data/default-rpc.list';
import delegationMocks from 'src/__tests__/background/requests/operations/ops/mocks/delegation-mocks';
import { PropsRequestDelegation } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: delegationMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestDelegation,
};
