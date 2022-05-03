import { ActiveAccount } from '@interfaces/active-account.interface';
import { Lease } from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import HiveUtils from 'src/utils/hive.utils';

export enum LeaseKeys {
  CANCEL_REQUEST = 'keychain_lease_cancel_request',
  REQUEST = 'keychain_lease_request',
  ACCEPT_REQUEST = 'keychain_lease_accept_request',
  UNDELEGATE = 'keychain_lease_undelegate_request',
}

const downloadAllLeases = async (): Promise<Lease[]> => {
  const response = await fetch(
    process.env.DELEGATION_MARKET_BASE_API! + '/leases',
  );
  return response.json();
};

const cancelLeaseRequest = async (
  lease: Lease,
  activeAccount: ActiveAccount,
) => {
  return HiveUtils.sendCustomJson(
    {
      id: lease.id,
    },
    activeAccount,
    LeaseKeys.CANCEL_REQUEST,
  );
};
const acceptLeaseRequest = async (
  lease: Lease,
  activeAccount: ActiveAccount,
) => {
  return HiveUtils.sendLeaseDelegation(activeAccount, lease);
};
const undelegateLease = async (lease: Lease, activeAccount: ActiveAccount) => {
  return HiveUtils.sendCustomJson(
    {
      id: lease.id,
    },
    activeAccount,
    LeaseKeys.ACCEPT_REQUEST,
  );
};

export const DelegationMarketUtils = {
  downloadAllLeases,
  cancelLeaseRequest,
  acceptLeaseRequest,
  undelegateLease,
};
