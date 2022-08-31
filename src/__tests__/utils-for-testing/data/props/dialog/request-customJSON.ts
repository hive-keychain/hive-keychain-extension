import { DefaultRpcs } from '@reference-data/default-rpc.list';
import customJsonMocks from 'src/__tests__/background/requests/operations/ops/mocks/custom-json-mocks';
import { PropsRequestCustomJSON } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: customJsonMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestCustomJSON,
};
