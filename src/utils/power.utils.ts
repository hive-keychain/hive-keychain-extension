import {
  TransferToVestingOperation,
  WithdrawVestingOperation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const powerUp = async (
  from: string,
  to: string,
  amount: string,
  activeAccount: ActiveAccount,
) => {
  return HiveTxUtils.sendOperation(
    [getPowerUpOperation(from, to, amount)],
    activeAccount.keys.active!,
  );
};

const powerDown = async (
  username: string,
  amount: string,
  activeAccount: ActiveAccount,
) => {
  return HiveTxUtils.sendOperation(
    [getPowerDownOperation(username, amount)],
    activeAccount.keys.active!,
  );
};

const getPowerUpOperation = (from: string, to: string, amount: string) => {
  return [
    'transfer_to_vesting',
    {
      from: from,
      to: to,
      amount: amount,
    },
  ] as TransferToVestingOperation;
};
const getPowerDownOperation = (username: string, amount: string) => {
  return [
    'withdraw_vesting',
    {
      account: username,
      vesting_shares: amount,
    },
  ] as WithdrawVestingOperation;
};

export const PowerUtils = {
  powerUp,
  powerDown,
  getPowerDownOperation,
  getPowerUpOperation,
};
