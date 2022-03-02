import { ClaimReward, Transfer } from '@interfaces/transaction.interface';

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

export const WalletHistoryUtils = {
  filterTransfer,
  filterClaimReward,
};
