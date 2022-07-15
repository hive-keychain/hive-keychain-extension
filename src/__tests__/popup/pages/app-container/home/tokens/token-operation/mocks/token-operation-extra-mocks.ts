import AccountUtils from 'src/utils/account.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';
import tokenOperation from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { FakeOperationResult } from 'src/__tests__/utils-for-testing/types/token-operation-types';
const mocks = {
  incomingOutcoming: () => {
    HiveEngineUtils.getIncomingDelegations = jest
      .fn()
      .mockResolvedValue(tokensUser.incomingDelegations);
    HiveEngineUtils.getOutgoingDelegations = jest
      .fn()
      .mockResolvedValue(tokensUser.outcomingDelegations);
  },
  doesAccountExist: (exist: boolean) =>
    (AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(exist)),
  delegateToken: () =>
    (HiveEngineUtils.delegateToken = jest
      .fn()
      .mockResolvedValue(tokenOperation.constants.tokenOperationResult)),
  stakeToken: () =>
    (HiveEngineUtils.stakeToken = jest
      .fn()
      .mockResolvedValue(tokenOperation.constants.tokenOperationResult)),
  unstakeToken: () =>
    (HiveEngineUtils.unstakeToken = jest
      .fn()
      .mockResolvedValue(tokenOperation.constants.tokenOperationResult)),
  saveTransferRecipient: () =>
    (TransferUtils.saveTransferRecipient = jest
      .fn()
      .mockResolvedValue(undefined)),
  tryConfirmTransaction: (result: FakeOperationResult) =>
    (BlockchainTransactionUtils.tryConfirmTransaction = jest
      .fn()
      .mockResolvedValue(tokenOperation.operationResult[result])),
};
export default { mocks };
