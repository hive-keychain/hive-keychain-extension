import {
  TransferToVestingOperation,
  WithdrawVestingOperation,
} from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const powerUp = async (
  from: string,
  to: string,
  amount: string,
  activeKey: Key,
) => {
  return HiveTxUtils.sendOperation(
    [getPowerUpOperation(from, to, amount)],
    activeKey,
  );
};

const powerDown = async (username: string, amount: string, activeKey: Key) => {
  return HiveTxUtils.sendOperation(
    [getPowerDownOperation(username, amount)],
    activeKey,
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
