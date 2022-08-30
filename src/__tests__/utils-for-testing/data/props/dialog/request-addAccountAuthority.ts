import { DefaultRpcs } from '@reference-data/default-rpc.list';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import { PropsRequestAddAccountAuthority } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: authority.constants.data.addAccountAuthority,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestAddAccountAuthority,
};
