import {
  Asset,
  TransferFromSavingsOperation,
  TransferToSavingsOperation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import Logger from 'src/utils/logger.utils';

/* istanbul ignore next */
const deposit = async (
  activeAccount: ActiveAccount,
  amount: string,
  receiver: string,
) => {
  return HiveTxUtils.sendOperation(
    [await getDepositOperation(activeAccount.name!, receiver, amount)],
    activeAccount.keys.active!,
  );
};
/* istanbul ignore next */
const withdraw = async (
  activeAccount: ActiveAccount,
  amount: string,
  to: string,
) => {
  return HiveTxUtils.sendOperation(
    [await getWithdrawOperation(activeAccount.name!, to, amount)],
    activeAccount.keys.active!,
  );
};

const getWithdrawOperation = async (
  from: string,
  to: string,
  amount: string,
) => {
  return [
    'transfer_from_savings',
    {
      amount: amount,
      from: from,
      memo: '',
      request_id: await SavingsUtils.getRequestId(from),
      to,
    },
  ] as TransferFromSavingsOperation;
};

const getDepositOperation = async (
  from: string,
  to: string,
  amount: string,
) => {
  return [
    'transfer_to_savings',
    {
      amount: amount,
      from: from,
      memo: '',
      request_id: await SavingsUtils.getRequestId(from),
      to,
    },
  ] as TransferToSavingsOperation;
};

const getRequestId = async (username: string) => {
  const savings = await HiveTxUtils.getData(
    'condenser_api.get_savings_withdraw_from',
    [username],
  );
  return Math.max(...savings.map((e: any) => e.request_id), 0) + 1;
};

/* istanbul ignore next */
const hasBalance = (balance: string | Asset, greaterOrEqualTo: number) => {
  return typeof balance === 'string'
    ? Asset.fromString(balance as string).amount >= greaterOrEqualTo
    : balance.amount >= greaterOrEqualTo;
};

const claimSavings = async (activeAccount: ActiveAccount) => {
  const { hbd_balance, savings_hbd_balance } = activeAccount.account;
  const hasHbd = hasBalance(hbd_balance, 0.001);
  const hasSavings = hasBalance(savings_hbd_balance, 0.001);
  if (hasHbd) {
    return SavingsUtils.deposit(
      activeAccount,
      '0.001 HBD',
      activeAccount.name!,
    );
  } else if (hasSavings) {
    return SavingsUtils.withdraw(
      activeAccount,
      '0.001 HBD',
      activeAccount.name!,
    );
  } else {
    Logger.error(
      `@${activeAccount.name} has no HBD to deposit or savings to withdraw`,
    );
    return false;
  }
};

export const SavingsUtils = {
  getWithdrawOperation,
  getDepositOperation,
  withdraw,
  deposit,
  getRequestId,
  hasBalance,
  claimSavings,
};
