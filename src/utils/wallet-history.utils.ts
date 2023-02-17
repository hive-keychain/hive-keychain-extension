import {
  ClaimReward,
  CollateralizedConvert,
  Convert,
  Delegation,
  DepositSavings,
  FillCollateralizedConvert,
  FillConvert,
  PowerDown,
  PowerUp,
  ReceivedInterests,
  StartWithdrawSavings,
  Transfer,
  WithdrawSavings,
} from '@interfaces/transaction.interface';

const filterTransfer = (
  transfer: Transfer,
  filterValue: string,
  activeAccountName: string,
) => {
  return (
    transfer.memo?.toLowerCase().includes(filterValue.toLowerCase()) ||
    transfer.amount?.toLowerCase().includes(filterValue.toLowerCase()) ||
    (transfer.to !== activeAccountName &&
      transfer.to?.toLowerCase().includes(filterValue.toLowerCase())) ||
    (transfer.from !== activeAccountName &&
      transfer.from?.toLowerCase().includes(filterValue.toLowerCase()))
  );
};

const filterClaimReward = (claim: ClaimReward, filterValue: string) => {
  return [claim.hbd, claim.hive, claim.hp]
    .join(' ')
    .toLowerCase()
    .includes(filterValue.toLowerCase());
};

const filterPowerUpDown = (
  transaction: PowerDown | PowerUp,
  filterValue: string,
) => {
  return transaction.amount.toLowerCase().includes(filterValue.toLowerCase());
};

const filterSavingsTransaction = (
  transaction: WithdrawSavings | DepositSavings | StartWithdrawSavings,
  filterValue: string,
) => {
  return transaction.amount.toLowerCase().includes(filterValue.toLowerCase());
};

const filterDelegation = (
  delegation: Delegation,
  filterValue: string,
  activeAccountName: string,
) => {
  return (
    delegation.amount.toLowerCase().includes(filterValue.toLowerCase()) ||
    (delegation.delegatee !== activeAccountName &&
      delegation.delegatee
        ?.toLowerCase()
        .includes(filterValue.toLowerCase())) ||
    (delegation.delegator !== activeAccountName &&
      delegation.delegator?.toLowerCase().includes(filterValue.toLowerCase()))
  );
};

const filterInterest = (interest: ReceivedInterests, filterValue: string) => {
  return interest.interest.toLowerCase().includes(filterValue.toLowerCase());
};

const filterConversion = (
  conversion: Convert | CollateralizedConvert,
  filterValue: string,
) => {
  return conversion.amount
    .toString()
    .toLowerCase()
    .includes(filterValue.toLowerCase());
};
const filterFillConversion = (
  fillConversion: FillConvert | FillCollateralizedConvert,
  filterValue: string,
) => {
  return (
    fillConversion.amount_in
      .toString()
      .toLowerCase()
      .includes(filterValue.toLowerCase()) ||
    fillConversion.amount_out
      .toString()
      .toLowerCase()
      .includes(filterValue.toLowerCase())
  );
};

export const WalletHistoryUtils = {
  filterTransfer,
  filterClaimReward,
  filterDelegation,
  filterPowerUpDown,
  filterSavingsTransaction,
  filterInterest,
  filterFillConversion,
  filterConversion,
};
