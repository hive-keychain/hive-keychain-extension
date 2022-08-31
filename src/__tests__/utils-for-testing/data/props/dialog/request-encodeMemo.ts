import { DefaultRpcs } from '@reference-data/default-rpc.list';
import encodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/encode-memo';
import { PropsRequestEncodeMemo } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: encodeMemo.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestEncodeMemo,
};
