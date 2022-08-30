import { DefaultRpcs } from '@reference-data/default-rpc.list';
import proxyMocks from 'src/__tests__/background/requests/operations/ops/mocks/proxy-mocks';
import { PropsRequestProxy } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: proxyMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestProxy,
};
