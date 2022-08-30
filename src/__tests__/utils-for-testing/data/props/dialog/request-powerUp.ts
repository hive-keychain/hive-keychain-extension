import { DefaultRpcs } from '@reference-data/default-rpc.list';
import powerMocks from 'src/__tests__/background/requests/operations/ops/mocks/power-mocks';
import { PropsRequestPowerUp } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    data: powerMocks.constants.data.powerUp,
    domain: 'domain',
    tab: 0,
    rpc: DefaultRpcs[0],
  } as PropsRequestPowerUp,
};
