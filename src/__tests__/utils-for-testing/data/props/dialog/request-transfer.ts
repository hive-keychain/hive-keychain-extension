import { DefaultRpcs } from '@reference-data/default-rpc.list';
import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
import { PropsRequestTransfer } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: transferMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestTransfer,
};
