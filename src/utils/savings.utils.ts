import {
  TransferFromSavingsOperation,
  TransferToSavingsOperation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

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

export const SavingsUtils = {
  getWithdrawOperation,
  getDepositOperation,
  withdraw,
  deposit,
  getRequestId,
};
