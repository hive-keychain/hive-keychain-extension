import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import AccountUtils from 'src/utils/account.utils';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import TokensUtils from 'src/utils/tokens.utils';
import tokenOperation from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation';
import { FakeOperationResult } from 'src/__tests__/utils-for-testing/types/token-operation-types';
const mocks = {
  doesAccountExist: (exist: boolean) =>
    (AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(exist)),
  delegateToken: (
    result: HiveEngineTransactionStatus | undefined,
    error?: Error,
  ) => {
    if (!error) {
      TokensUtils.delegateToken = jest.fn().mockResolvedValue(result);
    } else {
      TokensUtils.delegateToken = jest.fn().mockRejectedValue(error);
    }
  },
  stakeToken: (
    result: HiveEngineTransactionStatus | undefined,
    error?: Error,
  ) => {
    if (!error) {
      TokensUtils.stakeToken = jest.fn().mockResolvedValue(result);
    } else {
      TokensUtils.stakeToken = jest.fn().mockRejectedValue(error);
    }
  },
  unstakeToken: (
    result: HiveEngineTransactionStatus | undefined,
    error?: Error,
  ) => {
    if (!error) {
      TokensUtils.unstakeToken = jest.fn().mockResolvedValue(result);
    } else {
      TokensUtils.unstakeToken = jest.fn().mockRejectedValue(error);
    }
  },
  saveTransferRecipient: () =>
    (FavoriteUserUtils.saveFavoriteUser = jest
      .fn()
      .mockResolvedValue(undefined)),
  tryConfirmTransaction: (result: FakeOperationResult) =>
    (HiveEngineUtils.tryConfirmTransaction = jest
      .fn()
      .mockResolvedValue(tokenOperation.operationResult[result])),
};
export default { mocks };
