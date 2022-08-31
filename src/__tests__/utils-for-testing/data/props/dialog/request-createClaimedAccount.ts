import { DefaultRpcs } from '@reference-data/default-rpc.list';
import createClaimedAccount from 'src/__tests__/background/requests/operations/ops/mocks/create-claimed-account';
import { PropsRequestCreateClaimedAccount } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: createClaimedAccount.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestCreateClaimedAccount,
};
