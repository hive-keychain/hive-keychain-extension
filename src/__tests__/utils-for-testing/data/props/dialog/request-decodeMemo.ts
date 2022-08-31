import { DefaultRpcs } from '@reference-data/default-rpc.list';
import decodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/decode-memo';
import { PropsRequestDecodeMemo } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: decodeMemo.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestDecodeMemo,
};
