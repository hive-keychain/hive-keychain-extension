import { DefaultRpcs } from '@reference-data/default-rpc.list';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import { PropsRequestPost } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: postMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestPost,
};
