import { DefaultRpcs } from '@reference-data/default-rpc.list';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import {
  PropsRequestCreateProposal,
  PropsRequestRemoveProposal,
} from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  create: {
    props: {
      data: proposalsMocks.constants.data.create,
      domain: 'domain',
      tab: 0,
      rpc: DefaultRpcs[0],
    } as PropsRequestCreateProposal,
  },
  remove: {
    props: {
      data: proposalsMocks.constants.data.remove,
      domain: 'domain',
      tab: 0,
      rpc: DefaultRpcs[0],
    } as PropsRequestRemoveProposal,
  },
};
