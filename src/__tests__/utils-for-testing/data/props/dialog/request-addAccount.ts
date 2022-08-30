import { DefaultRpcs } from '@reference-data/default-rpc.list';
import addAccountMocks from 'src/__tests__/background/requests/operations/ops/mocks/add-account-mocks';
import { PropsRequestAddAccount } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: addAccountMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestAddAccount,
};
