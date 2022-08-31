import { DefaultRpcs } from '@reference-data/default-rpc.list';
import recurrentTransferMocks from 'src/__tests__/background/requests/operations/ops/mocks/recurrent-transfer-mocks';
import { PropsRequestRecurrentTransfer } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: recurrentTransferMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestRecurrentTransfer,
};
