import { DefaultRpcs } from '@reference-data/default-rpc.list';
import signMessageMocks from 'src/__tests__/background/requests/operations/ops/mocks/signMessage-mocks';
import { PropsRequestSignBuffer } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: signMessageMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestSignBuffer,
};
