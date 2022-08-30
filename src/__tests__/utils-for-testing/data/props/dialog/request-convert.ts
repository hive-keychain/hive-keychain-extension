import { DefaultRpcs } from '@reference-data/default-rpc.list';
import convertMocks from 'src/__tests__/background/requests/operations/ops/mocks/convert-mocks';
import { PropsRequestConvert } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: convertMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestConvert,
};
