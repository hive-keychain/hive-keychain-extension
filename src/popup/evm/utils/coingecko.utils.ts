import { CoingeckoApi } from '@api/coingecko';

const fetchCoingeckoPrices = async (coingeckoIds: string[]) => {
  const ids = [
    ...new Set(
      coingeckoIds.map((id) => id.trim()).filter((id) => id.length > 0),
    ),
  ];
  if (ids.length === 0) {
    return {};
  }

  const response = await CoingeckoApi.get(
    'simple/price',
    `ids=${ids.join(',')}&vs_currencies=usd`,
  );
  return response;
};

export const CoingeckoUtils = {
  fetchCoingeckoPrices,
};
