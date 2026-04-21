import { CoingeckoApi } from '@api/coingecko';

const fetchCoingeckoPrices = async (coingeckoIds: string[]) => {
  const response = await CoingeckoApi.get(
    `/simple/price`,
    `ids=${coingeckoIds.join(',')}&vs_currencies=usd`,
  );
  return response;
};

export const CoingeckoUtils = {
  fetchCoingeckoPrices,
};
