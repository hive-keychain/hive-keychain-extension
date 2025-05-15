import { KeychainApi } from '@api/keychain';
import type { DelegateVestingSharesOperation } from '@hiveio/dhive';
import {
  Delegator,
  PendingOutgoingUndelegation,
} from '@interfaces/delegations.interface';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

const getDelegators = async (name: string) => {
  const delegators = (await KeychainApi.get(
    `hive/delegators/${name}`,
  )) as Delegator[];
  return delegators
    ? delegators
        .filter((e) => e.vesting_shares !== 0)
        .sort((a, b) => b.vesting_shares - a.vesting_shares)
    : null;
};

const getDelegatees = async (name: string) => {
  const LIMIT = 1000;
  let delegatees: any[] = [];
  let from = '';
  delegatees = await HiveTxUtils.getData(
    'condenser_api.get_vesting_delegations',
    [name, from, LIMIT],
  );

  return delegatees
    .filter((e) => parseFloat(e.vesting_shares + '') !== 0)
    .sort(
      (a, b) =>
        parseFloat(b.vesting_shares + '') - parseFloat(a.vesting_shares + ''),
    );
};

const getPendingOutgoingUndelegation = async (name: string) => {
  const pendingDelegations = await HiveTxUtils.getData(
    'database_api.find_vesting_delegation_expirations',
    { account: name },
    'delegations',
  );
  return pendingDelegations.map((pendingUndelegation: any) => {
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
  delegator: string,
  delegatee: string,
  vestingShares: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return await HiveTxUtils.sendOperation(
    [getDelegationOperation(delegatee, delegator, vestingShares)],
    activeKey,
    false,
    options,
  );
};
/* istanbul ignore next */
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
/* istanbul ignore next */
const getDelegationTransaction = (
  delegatee: string,
  delegator: string,
  amount: string,
) => {
  return HiveTxUtils.createTransaction([
    DelegationUtils.getDelegationOperation(delegatee, delegator, amount),
  ]);
};

export const DelegationUtils = {
  getDelegationOperation,
  delegateVestingShares,
  getDelegators,
  getDelegatees,
  getPendingOutgoingUndelegation,
  getDelegationTransaction,
};
