import { DefaultRpcs } from '@reference-data/default-rpc.list';
import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
import { PropsRequestsSignTx } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: signTxMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestsSignTx,
};
