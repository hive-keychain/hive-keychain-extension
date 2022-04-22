import { DelegationRequest } from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';

const downloadAllLeases = async (): Promise<DelegationRequest[]> => {
  const response = await fetch(
    process.env.DELEGATION_MARKET_BASE_API! + '/leases',
  );
  return response.json();
};

export const DelegationMarketUtils = {
  downloadAllLeases,
};
