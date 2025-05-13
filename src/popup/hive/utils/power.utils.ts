import {
  TransferToVestingOperation,
  WithdrawVestingOperation,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

const powerUp = async (
  from: string,
  to: string,
  amount: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [getPowerUpOperation(from, to, amount)],
    activeKey,
    false,
    options,
  );
};

const powerDown = async (
  username: string,
  amount: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [getPowerDownOperation(username, amount)],
    activeKey,
    false,
    options,
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

const getPowerUpTransaction = (from: string, to: string, amount: string) => {
  return HiveTxUtils.createTransaction([
    PowerUtils.getPowerUpOperation(from, to, amount),
  ]);
};

const getPowerDownTransaction = (username: string, amount: string) => {
  return HiveTxUtils.createTransaction([
    PowerUtils.getPowerDownOperation(username, amount),
  ]);
};

export const PowerUtils = {
  powerUp,
  powerDown,
  getPowerDownOperation,
  getPowerUpOperation,
  getPowerUpTransaction,
  getPowerDownTransaction,
};
