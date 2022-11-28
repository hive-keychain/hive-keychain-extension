import KeychainApi from '@api/keychain';
import { DelegateVestingSharesOperation } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import {
  Delegator,
  PendingOutgoingUndelegation,
} from '@interfaces/delegations.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import HiveUtils from 'src/utils/hive.utils';

const getDelegators = async (name: string) => {
  return (
    (await KeychainApi.get(`/hive/delegators/${name}`)).data as Delegator[]
  )
    .filter((e) => e.vesting_shares !== 0)
    .sort((a, b) => b.vesting_shares - a.vesting_shares);
};

const getDelegatees = async (name: string) => {
  //   return (await getClient().database.getVestingDelegations(name, '', 1000))
  //     .filter((e) => parseFloat(e.vesting_shares + '') !== 0)
  //     .sort(
  //       (a, b) =>
  //         parseFloat(b.vesting_shares + '') - parseFloat(a.vesting_shares + ''),
  //     );
};

const getPendingOutgoingUndelegation = async (name: string) => {
  return (
    await HiveUtils.getClient().database.call(
      'find_vesting_delegation_expirations',
      [name],
    )
  ).delegations.map((pendingUndelegation: any) => {
    return {
      delegator: pendingUndelegation.delegator,
      expiration_date: pendingUndelegation.expiration,
      vesting_shares:
        parseInt(pendingUndelegation.vesting_shares.amount) / 1000000,
    } as PendingOutgoingUndelegation;
  });
};

/* istanbul ignore next */
const delegateVestingShares = async (
  activeAccount: ActiveAccount,
  delegatee: string,
  vestingShares: string,
) => {
  return await HiveTxUtils.sendOperation(
    [getDelegationOperation(delegatee, activeAccount.name!, vestingShares)],
    activeAccount.keys.active!,
  );
};

const getDelegationOperation = (
  delegatee: string,
  delegator: string,
  amount: string,
) => {
  return [
    'delegate_vesting_shares',
    {
      delegatee,
      delegator,
      vesting_shares: amount,
    },
  ] as DelegateVestingSharesOperation;
};

export const DelegationUtils = {
  getDelegationOperation,
  delegateVestingShares,
  getDelegators,
  getDelegatees,
  getPendingOutgoingUndelegation,
};
