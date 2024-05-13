// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { BaseApi } from 'src/api/base';

const buildUrl = (chainId: string) => {
  return `https://gas.api.cx.metamask.io/networks/${chainId}/suggestedGasFees`;
};

const get = async (chainId: string): Promise<any> => {
  return await BaseApi.get(buildUrl(chainId));
};

export const MetamaskGasFeeApi = {
  get,
};
