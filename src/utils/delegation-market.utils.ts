import {
  CustomJsonOperation,
  DelegateVestingSharesOperation,
  Operation,
  PrivateKey,
  TransferOperation,
  VestingDelegation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import {
  Lease,
  LeaseRequest,
} from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { store } from '@popup/store';
import HiveUtils from 'src/utils/hive.utils';

export const KEYCHAIN_DELEGATION_MARKET_ACCOUNT = 'cedric.tests';

export enum LeaseKeys {
  CANCEL_REQUEST = 'keychain_lease_cancel_request',
  REQUEST = 'keychain_lease_request',
  ACCEPT_REQUEST = 'keychain_lease_accept_request',
  UNDELEGATE = 'keychain_lease_undelegate_request',
  CANCEL_DELEGATION = 'keychain_lease_cancel_delegation',
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
  delegationTotalAmount: number,
) => {
  return await HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.sendOperations(
      [
        [
          'custom_json',
          {
            id: LeaseKeys.ACCEPT_REQUEST,
            required_auths: [activeAccount.name!],
            required_posting_auths: activeAccount.keys.active
              ? []
              : [activeAccount.name!],
            json: JSON.stringify({
              leaseId: lease.id,
            }),
          } as CustomJsonOperation[1],
        ],
        [
          'delegate_vesting_shares',
          {
            delegator: activeAccount.name!,
            delegatee: lease.creator,
            vesting_shares: delegationTotalAmount + ' VESTS',
          } as DelegateVestingSharesOperation[1],
        ],
      ],
      PrivateKey.fromString(
        store.getState().activeAccount.keys.active as string,
      ),
    ),
  );
};

const getPreviousAndNewDelegationToUser = (
  outgoingDelegations: VestingDelegation[],
  lease: Lease,
  cancelation?: boolean,
): [number, number] => {
  const existingDelegation = outgoingDelegations.find(
    (delegation) => delegation.delegatee === lease.creator,
  );

  const oldDelegation = existingDelegation
    ? parseFloat(
        existingDelegation.vesting_shares.toString().replace(' VESTS', ''),
      )
    : 0;

  if (cancelation) {
    return [oldDelegation, oldDelegation - lease.value];
  } else {
    return [oldDelegation, lease.value + oldDelegation];
  }
};

const undelegateLease = async (
  lease: Lease,
  activeAccount: ActiveAccount,
  newDelegationAmount: number,
) => {
  return await HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.sendOperations(
      [
        [
          'custom_json',
          {
            id: LeaseKeys.CANCEL_DELEGATION,
            required_auths: [activeAccount.name!],
            required_posting_auths: activeAccount.keys.active
              ? []
              : [activeAccount.name!],
            json: JSON.stringify({
              leaseId: lease.id,
            }),
          } as CustomJsonOperation[1],
        ],
        [
          'delegate_vesting_shares',
          {
            delegator: activeAccount.name!,
            delegatee: lease.creator,
            vesting_shares: newDelegationAmount + ' VESTS',
          } as DelegateVestingSharesOperation[1],
        ],
      ],
      PrivateKey.fromString(
        store.getState().activeAccount.keys.active as string,
      ),
    ),
  );
};

const createLeaseRequest = async (
  leaseRequest: LeaseRequest,
  amount: string,
  activeAccount: ActiveAccount,
  delegationValueInHp: string,
) => {
  return await HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.sendOperations(
      [
        [
          'custom_json',
          {
            id: LeaseKeys.REQUEST,
            required_auths: [activeAccount.name!],
            required_posting_auths: activeAccount.keys.active
              ? []
              : [activeAccount.name!],
            json: JSON.stringify(leaseRequest),
          } as CustomJsonOperation[1],
        ] as Operation,
        [
          'transfer',
          {
            amount: amount,
            from: activeAccount.name!,
            to: KEYCHAIN_DELEGATION_MARKET_ACCOUNT,
            memo: chrome.i18n.getMessage('popup_html_lease_request_memo', [
              delegationValueInHp,
              leaseRequest.duration.toString(),
            ]),
          } as TransferOperation[1],
        ],
      ],
      PrivateKey.fromString(
        store.getState().activeAccount.keys.active as string,
      ),
    ),
  );
};

export const DelegationMarketUtils = {
  downloadAllLeases,
  cancelLeaseRequest,
  acceptLeaseRequest,
  undelegateLease,
  getPreviousAndNewDelegationToUser,
  createLeaseRequest,
};
