import { DefaultRpcs } from '@reference-data/default-rpc.list';
import Config from 'src/config';
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import { PropsRequestSendToken } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: sendTokenMocks.constants.data,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
    hiveEngineConfig: Config.hiveEngine,
  } as PropsRequestSendToken,
};
