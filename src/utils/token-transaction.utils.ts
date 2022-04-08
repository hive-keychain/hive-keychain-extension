import {
  CommentCurationTransaction,
  DelegationTokenTransaction,
  MiningLotteryTransaction,
  StakeTokenTransaction,
  TransferTokenTransaction,
} from '@interfaces/tokens.interface';

const filterCurationReward = (
  t: CommentCurationTransaction,
  value: string,
): boolean => {
  value = value.toLowerCase();
  return t.authorPerm.toLowerCase().includes(value);
};

const filterTransfer = (
  t: TransferTokenTransaction,
  value: string,
): boolean => {
  value = value.toLowerCase();
  return (
    t.to.toLowerCase().includes(value) ||
    t.from.toLowerCase().includes(value) ||
    t.memo?.toLowerCase().includes(value)
  );
};

const filterStake = (t: StakeTokenTransaction, value: string): boolean => {
  value = value.toLowerCase();
  return (
    t.to.toLowerCase().includes(value) || t.from.toLowerCase().includes(value)
  );
};

const filterDelegation = (
  t: DelegationTokenTransaction,
  value: string,
): boolean => {
  value = value.toLowerCase();
  return (
    t.delegator.toLowerCase().includes(value) ||
    t.delegatee.toLowerCase().includes(value)
  );
};

const filterMiningLottery = (
  t: MiningLotteryTransaction,
  value: string,
): boolean => {
  value = value.toLowerCase();
  return t.poolId.toLowerCase().includes(value);
};

export const TokenTransactionUtils = {
  filterTransfer,
  filterStake,
  filterDelegation,
  filterCurationReward,
  filterMiningLottery,
};
