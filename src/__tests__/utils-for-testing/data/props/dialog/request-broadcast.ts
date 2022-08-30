import { DefaultRpcs } from '@reference-data/default-rpc.list';
import broadcast from 'src/__tests__/background/requests/operations/ops/mocks/broadcast';
import { PropsRequestBroadcast } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: broadcast.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestBroadcast,
};
